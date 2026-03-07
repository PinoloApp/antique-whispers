const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { CloudTasksClient } = require("@google-cloud/tasks");

// Initialize Firebase Admin SDK
admin.initializeApp();
const client = new CloudTasksClient();

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

// Cloud Tasks configuration
const PROJECT_ID = "sfink-5fe77";
const QUEUE_LOCATION = "us-central1";
const QUEUE_NAME = "auction-scheduler";
// Gen 2 functions have a different URL format: https://<func-name>-x5tw3vikwq-uc.a.run.app
const BASE_URL = "https://%FUNC_NAME%-x5tw3vikwq-uc.a.run.app";

exports.registerUser = onCall(async (request) => {
    const { email, password, name } = request.data;

    if (!email || !password || !name) {
        throw new HttpsError(
            "invalid-argument",
            "The function must be called with email, password, and name."
        );
    }

    try {
        // 1. Create the user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Add default custom claim
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: "user" });

        // 3. Save the user document in Firestore
        const db = admin.firestore();
        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
            role: "user", // Initial role
            status: "active", // Initial status
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error("Error creating user:", error);
        throw new HttpsError("internal", error.message);
    }
});

// syncGoogleUser — call this after Google Sign-In to ensure document and claims exist
exports.syncGoogleUser = onCall(async (request) => {
    // Ensure the user is authenticated via Firebase Auth
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email;
    const name = request.auth.token.name || request.data?.displayName || "Unknown";

    try {
        const db = admin.firestore();
        const userRef = db.collection("users").doc(uid);
        const docSnap = await userRef.get();

        // Only create if the document doesn't already exist
        if (!docSnap.exists) {
            await userRef.set({
                uid: uid,
                email: email,
                name: name,
                role: "user",
                status: "active",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                totalBids: 0,
                wonAuctions: 0
            });

            // Set default custom claim
            await admin.auth().setCustomUserClaims(uid, { role: "user" });
            console.log(`Synced new Google user ${uid} to Firestore.`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error syncing Google user:", error);
        throw new HttpsError("internal", error.message);
    }
});

// a) setUserRole — onCall funkcija
exports.setUserRole = onCall(async (request) => {
    // Provjera: request.auth mora postojati
    if (!request.auth || !request.auth.token) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    // Provjera: request.auth.token.role === "admin"
    if (request.auth.token.role !== "admin") {
        throw new HttpsError("permission-denied", "Caller must be an admin to perform this action.");
    }

    const { uid, role } = request.data;

    if (!uid || !role) {
        throw new HttpsError("invalid-argument", "The function must be called with uid and role.");
    }

    // Validacija: role mora biti "admin" | "user"
    if (role !== "admin" && role !== "user") {
        throw new HttpsError("invalid-argument", "Role must be 'admin' or 'user'.");
    }

    try {
        // Postavi custom claim na target user
        await admin.auth().setCustomUserClaims(uid, { role });

        // Ažuriraj Firestore dokument
        const db = admin.firestore();
        await db.collection("users").doc(uid).update({ role });

        return { success: true };
    } catch (error) {
        console.error("Error setting custom user claim or updating firestore:", error);
        throw new HttpsError("internal", error.message);
    }
});

// b) onUserRoleWrite — automatska sinhronizacija na Firestore promijeni
exports.onUserRoleWrite = onDocumentUpdated("users/{uid}", async (event) => {
    const newValue = event.data.after.data();
    const previousValue = event.data.before.data();
    const uid = event.params.uid;

    const newRole = newValue.role;
    const oldRole = previousValue.role;

    // Triggera se kada se users/{uid}.role promijeni, ovo osigurava 
    // sinhronizaciju custom claims-a čak i ako se netko igra direktno sa DB iz backend skripti.
    if (newRole && newRole !== oldRole) {
        console.log(`Role state changed in Firestore for user ${uid}. Auto-syncing Auth Custom Claim to: ${newRole}`);
        try {
            await admin.auth().setCustomUserClaims(uid, { role: newRole });
            console.log(`Successfully synced custom claim role '${newRole}' for user ${uid}`);
        } catch (error) {
            console.error(`Error auto-syncing custom claim for user ${uid}:`, error);
        }
    }
});

// c) adminDeleteUser
exports.adminDeleteUser = onCall(async (request) => {
    if (!request.auth || !request.auth.token || request.auth.token.role !== "admin") {
        throw new HttpsError("permission-denied", "Caller must be an admin to perform this action.");
    }

    const { uid } = request.data;
    if (!uid) {
        throw new HttpsError("invalid-argument", "Missing uid.");
    }

    try {
        await admin.auth().deleteUser(uid);
        await admin.firestore().collection("users").doc(uid).delete();
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new HttpsError("internal", error.message);
    }
});

// d) adminUpdateUser
exports.adminUpdateUser = onCall(async (request) => {
    if (!request.auth || !request.auth.token || request.auth.token.role !== "admin") {
        throw new HttpsError("permission-denied", "Caller must be an admin to perform this action.");
    }

    const { uid, data } = request.data;
    if (!uid || !data) {
        throw new HttpsError("invalid-argument", "Missing uid or data.");
    }

    try {
        // Obnavljamo Auth podatke ako su proslijeđeni email, firstName ili lastName
        const authUpdates = {};
        if (data.email) authUpdates.email = data.email;
        if (data.firstName && data.lastName) {
            authUpdates.displayName = `${data.firstName} ${data.lastName}`;
        }

        if (Object.keys(authUpdates).length > 0) {
            await admin.auth().updateUser(uid, authUpdates);
        }

        // Ažuriramo Firestore
        await admin.firestore().collection("users").doc(uid).update(data);
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        throw new HttpsError("internal", error.message);
    }
});

// ============================================================
// AUCTION SCHEDULING — Cloud Tasks for auto-activation & auto-completion
// ============================================================

/**
 * activateAuction — HTTP endpoint triggered by Cloud Tasks at startDate.
 * Changes auction status from "upcoming" to "active".
 */
exports.activateAuction = onRequest(async (req, res) => {
    try {
        const { auctionId } = req.body;
        if (!auctionId) {
            res.status(400).json({ error: "Missing auctionId" });
            return;
        }

        const db = admin.firestore();
        const auctionRef = db.collection("auctions").doc(auctionId.toString());
        const auctionSnap = await auctionRef.get();

        if (!auctionSnap.exists) {
            console.log(`Auction ${auctionId} not found, skipping activation.`);
            res.status(200).json({ skipped: true, reason: "Auction not found" });
            return;
        }

        const auction = auctionSnap.data();
        if (auction.status !== "upcoming") {
            console.log(`Auction ${auctionId} status is "${auction.status}", not "upcoming". Skipping.`);
            res.status(200).json({ skipped: true, reason: `Status is ${auction.status}` });
            return;
        }

        await auctionRef.update({ status: "active" });
        console.log(`Auction ${auctionId} activated successfully.`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error activating auction:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * completeAuction — HTTP endpoint triggered by Cloud Tasks at endDate.
 * Changes auction status from "active" to "completed".
 * Marks lots/collections as "sold" or "available" based on bids.
 */
exports.completeAuction = onRequest(async (req, res) => {
    try {
        const { auctionId } = req.body;
        if (!auctionId) {
            res.status(400).json({ error: "Missing auctionId" });
            return;
        }

        const db = admin.firestore();
        const auctionRef = db.collection("auctions").doc(auctionId.toString());
        const auctionSnap = await auctionRef.get();

        if (!auctionSnap.exists) {
            console.log(`Auction ${auctionId} not found, skipping completion.`);
            res.status(200).json({ skipped: true, reason: "Auction not found" });
            return;
        }

        const auction = auctionSnap.data();
        if (auction.status !== "active") {
            console.log(`Auction ${auctionId} status is "${auction.status}", not "active". Skipping.`);
            res.status(200).json({ skipped: true, reason: `Status is ${auction.status}` });
            return;
        }

        // Process lots — check if they have bids (currentBid > startingPrice)
        const lotIds = (auction.lotIds || []).map(Number);
        for (const lotId of lotIds) {
            const productRef = db.collection("products").doc(lotId.toString());
            const productSnap = await productRef.get();
            if (productSnap.exists) {
                const product = productSnap.data();
                const hasBids = product.hasBids || product.currentBid > (product.startingPrice || 0);
                if (hasBids) {
                    await productRef.update({ status: "sold" });

                    // Finalize bids for this lot
                    const bidsSnap = await db.collection("bids")
                        .where("productId", "==", lotId)
                        .where("auctionId", "==", Number(auctionId))
                        .orderBy("maxAmount", "desc")
                        .orderBy("timestamp", "asc")
                        .get();

                    if (!bidsSnap.empty) {
                        const batch = db.batch();
                        const winningBidId = bidsSnap.docs[0].id;
                        bidsSnap.docs.forEach(bidDoc => {
                            batch.update(bidDoc.ref, {
                                isWinning: bidDoc.id === winningBidId
                            });
                        });
                        await batch.commit();
                    }
                } else {
                    await productRef.update({ status: "available", auctionId: 0 });
                }
            }
        }

        // Process collections — check if they have bids
        const collectionIds = (auction.collectionIds || []).map(Number);
        for (const colId of collectionIds) {
            const colRef = db.collection("collections").doc(colId.toString());
            const colSnap = await colRef.get();
            if (colSnap.exists) {
                const col = colSnap.data();
                const hasBids = col.hasBids || col.currentBid > (col.startingPrice || 0);
                if (hasBids) {
                    await colRef.update({ status: "sold" });

                    // Finalize bids for this collection
                    const bidsSnap = await db.collection("bids")
                        .where("productId", "==", colId)
                        .where("auctionId", "==", Number(auctionId))
                        .orderBy("maxAmount", "desc")
                        .orderBy("timestamp", "asc")
                        .get();

                    if (!bidsSnap.empty) {
                        const batch = db.batch();
                        const winningBidId = bidsSnap.docs[0].id;
                        bidsSnap.docs.forEach(bidDoc => {
                            batch.update(bidDoc.ref, {
                                isWinning: bidDoc.id === winningBidId
                            });
                        });
                        await batch.commit();
                    }
                } else {
                    await colRef.update({ status: "available", auctionId: 0 });
                }
            }
        }

        await auctionRef.update({ status: "completed" });
        console.log(`Auction ${auctionId} completed successfully. Processed ${lotIds.length} lots, ${collectionIds.length} collections.`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error completing auction:", error);
        res.status(500).json({ error: error.message });
    }
});

async function createScheduledTask(taskId, targetFunctionName, payload, scheduleTime) {
    console.log(`Scheduling task ${taskId} for ${targetFunctionName} at ${scheduleTime}`);

    const parent = client.queuePath(PROJECT_ID, QUEUE_LOCATION, QUEUE_NAME);
    const targetUrl = BASE_URL.replace("%FUNC_NAME%", targetFunctionName.toLowerCase());

    // Using taskId as the name part allows us to identify it, but we append a timestamp for uniqueness
    // to avoid the 1-hour name reuse restriction if we don't specify the name.
    // However, if we specify the name, we must be unique. Let's use the taskId as the ID.
    const taskName = `${parent}/tasks/${taskId}`;

    const task = {
        name: taskName,
        httpRequest: {
            httpMethod: "POST",
            url: targetUrl,
            headers: { "Content-Type": "application/json" },
            body: Buffer.from(JSON.stringify(payload)).toString("base64"),
            oidcToken: {
                serviceAccountEmail: `20905714148-compute@developer.gserviceaccount.com`,
            },
        },
        scheduleTime: {
            seconds: Math.floor(new Date(scheduleTime).getTime() / 1000),
        },
    };

    try {
        await client.createTask({ parent, task });
        console.log(`Task ${taskId} successfully scheduled.`);
        return taskName;
    } catch (error) {
        console.error(`Error in createTask for ${taskId}:`, error);
        throw error;
    }
}

/**
 * Helper: delete a Cloud Task by its full name or ID (ignores NOT_FOUND errors).
 */
async function deleteScheduledTask(taskNameOrId) {
    if (!taskNameOrId) return;

    let taskPath = taskNameOrId;
    if (!taskPath.startsWith("projects/")) {
        taskPath = client.taskPath(PROJECT_ID, QUEUE_LOCATION, QUEUE_NAME, taskNameOrId);
    }

    try {
        await client.deleteTask({ name: taskPath });
        console.log(`Task ${taskPath} deleted.`);
    } catch (error) {
        if (error.code === 5) {
            console.log(`Task ${taskPath} not found (already executed or deleted).`);
        } else {
            console.error(`Error deleting task ${taskPath}:`, error);
            // Don't throw here to avoid blocking rescheduling if one task fails to delete
        }
    }
}

/**
 * scheduleAuctionTasks — callable function to schedule activation & completion tasks.
 * Called from frontend after creating or updating an auction.
 */
exports.scheduleAuctionTasks = onCall(async (request) => {
    console.log("scheduleAuctionTasks started. Payload:", JSON.stringify(request.data));
    if (!request.auth || !request.auth.token || request.auth.token.role !== "admin") {
        throw new HttpsError("permission-denied", "Caller must be an admin.");
    }

    const { auctionId, startDate, endDate } = request.data;
    if (!auctionId || !startDate || !endDate) {
        throw new HttpsError("invalid-argument", "Missing auctionId, startDate, or endDate.");
    }

    try {
        const db = admin.firestore();
        const auctionRef = db.collection("auctions").doc(auctionId.toString());
        const auctionSnap = await auctionRef.get();

        if (!auctionSnap.exists) {
            throw new HttpsError("not-found", `Auction ${auctionId} not found.`);
        }

        const auctionData = auctionSnap.data();

        // 1. Cancel existing tasks if they exist
        if (auctionData.activationTaskName) {
            await deleteScheduledTask(auctionData.activationTaskName);
        }
        if (auctionData.completionTaskName) {
            await deleteScheduledTask(auctionData.completionTaskName);
        }

        const payload = { auctionId };
        const updates = {};
        const timestamp = Date.now();

        // 2. Schedule activation at startDate
        const startTime = new Date(startDate);
        const isAlreadyActive = auctionData.status === "active";

        if (!isAlreadyActive && startTime > new Date()) {
            const taskId = `act-${auctionId}-${timestamp}`;
            const name = await createScheduledTask(
                taskId,
                "activateAuction",
                payload,
                startDate
            );
            updates.activationTaskName = name;
        }

        // 3. Schedule completion at endDate
        const endTime = new Date(endDate);
        if (endTime > new Date()) {
            const taskId = `comp-${auctionId}-${timestamp}`;
            const name = await createScheduledTask(
                taskId,
                "completeAuction",
                payload,
                endDate
            );
            updates.completionTaskName = name;
        }

        // 4. Update Firestore with new task names
        if (Object.keys(updates).length > 0) {
            await auctionRef.update(updates);
        }

        return { success: true };
    } catch (error) {
        console.error("Error scheduling auction tasks:", error);
        throw new HttpsError("internal", error.message);
    }
});

/**
 * cancelAuctionTasks — callable function to cancel scheduled activation & completion tasks.
 */
exports.cancelAuctionTasks = onCall(async (request) => {
    if (!request.auth || !request.auth.token || request.auth.token.role !== "admin") {
        throw new HttpsError("permission-denied", "Caller must be an admin.");
    }

    const { auctionId, cancelActivation = true, cancelCompletion = true } = request.data;
    if (!auctionId) {
        throw new HttpsError("invalid-argument", "Missing auctionId.");
    }

    try {
        const db = admin.firestore();
        const auctionRef = db.collection("auctions").doc(auctionId.toString());
        const auctionSnap = await auctionRef.get();

        if (auctionSnap.exists) {
            const data = auctionSnap.data();
            const updates = {};

            if (cancelActivation && data.activationTaskName) {
                await deleteScheduledTask(data.activationTaskName);
                updates.activationTaskName = admin.firestore.FieldValue.delete();
            }
            if (cancelCompletion && data.completionTaskName) {
                await deleteScheduledTask(data.completionTaskName);
                updates.completionTaskName = admin.firestore.FieldValue.delete();
            }

            if (Object.keys(updates).length > 0) {
                await auctionRef.update(updates);
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error cancelling auction tasks:", error);
        throw new HttpsError("internal", error.message);
    }
});

/**
 * getProductBids — callable function to read bids for a product.
 * Returns only necessary bid data.
 */
exports.getProductBids = onCall(async (request) => {
    const productId = Number(request.data.productId);
    const auctionId = Number(request.data.auctionId);
    if (isNaN(productId) || isNaN(auctionId)) {
        throw new HttpsError("invalid-argument", "Missing or invalid productId or auctionId.");
    }

    try {
        const db = admin.firestore();
        const bidsSnap = await db.collection("bids")
            .where("productId", "==", productId)
            .where("auctionId", "==", auctionId)
            .orderBy("timestamp", "desc")
            .get();

        const bids = [];
        bidsSnap.forEach(doc => {
            const data = doc.data();
            bids.push({
                ...data,
                id: doc.id,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
            });
        });

        return { bids };
    } catch (error) {
        console.error("Error fetching product bids:", error);
        throw new HttpsError("internal", error.message);
    }
});

/**
 * placeBid — callable function to place a bid.
 * Handles proxy bidding logic server-side.
 */
exports.placeBid = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError("unauthenticated", "User must be logged in to bid.");
    }

    const productId = Number(request.data.productId);
    const auctionId = Number(request.data.auctionId);
    const { maxAmount, bidderName, bidderEmail, isLiveAuction } = request.data;
    if (isNaN(productId) || isNaN(auctionId) || !maxAmount || !bidderName) {
        throw new HttpsError("invalid-argument", "Missing or invalid bid data.");
    }

    console.log(`Attempting to place bid for productId: ${productId}, auctionId: ${auctionId}`);

    const db = admin.firestore();
    const productRef = db.collection("products").doc(productId.toString());
    const collectionRef = db.collection("collections").doc(productId.toString());
    const collectionProductRef = db.collection("collectionProducts").doc(productId.toString());
    const bidsRef = db.collection("bids");

    try {
        return await db.runTransaction(async (transaction) => {
            let itemSnap = await transaction.get(productRef);
            let itemData;
            let itemRef = productRef;

            if (!itemSnap.exists) {
                console.log(`Product not found, searching in collections for ID: ${productId}`);
                itemSnap = await transaction.get(collectionRef);
                if (!itemSnap.exists) {
                    console.log(`Collection not found, searching in collectionProducts for ID: ${productId}`);
                    itemSnap = await transaction.get(collectionProductRef);
                    if (!itemSnap.exists) {
                        console.error(`Item not found in Firestore. Path tried: products, collections, collectionProducts with ID: ${productId}`);
                        throw new Error(`Product or Collection not found: ${productId}`);
                    }
                    itemRef = collectionProductRef;
                } else {
                    itemRef = collectionRef;
                }
            }

            itemData = itemSnap.data();

            // Check if auction is active
            const auctionRef = db.collection("auctions").doc(itemData.auctionId.toString());
            const auctionSnap = await transaction.get(auctionRef);
            if (!auctionSnap.exists) throw new Error("Auction not found");
            const auctionData = auctionSnap.data();
            if (auctionData.status !== "active") {
                throw new Error("Bidding is only allowed for active auctions.");
            }

            // Get existing bids to calculate proxy. Use a query.
            const bidsQuery = bidsRef
                .where("productId", "==", productId)
                .where("auctionId", "==", auctionId);
            const bidsQuerySnap = await transaction.get(bidsQuery);
            const existingBids = [];
            bidsQuerySnap.forEach(d => {
                const data = d.data();
                existingBids.push({
                    ...data,
                    id: d.id,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
                });
            });
            console.log(`Found ${existingBids.length} existing bids for product ${productId}`);

            const newBidId = bidsRef.doc().id;
            const newBidDocRef = bidsRef.doc(newBidId);
            const timestamp = admin.firestore.Timestamp.now();

            const newBidObj = {
                productId,
                auctionId,
                maxAmount,
                bidderName,
                bidderEmail: bidderEmail || request.auth.token.email,
                userId: request.auth.uid,
                isLiveAuction: !!isLiveAuction,
                timestamp,
                isWinning: false,
                currentAmount: 0
            };

            const allBids = [...existingBids, { ...newBidObj, id: newBidId, timestamp: timestamp.toDate() }];

            // Proxy Bidding Logic
            const sortedBids = [...allBids].sort((a, b) => {
                if (b.maxAmount !== a.maxAmount) return b.maxAmount - a.maxAmount;
                return a.timestamp.getTime() - b.timestamp.getTime();
            });

            const highestBid = sortedBids[0];
            const winningBidId = highestBid.id;

            // Bid step logic from auction configuration
            const getBidStep = (val) => {
                if (!auctionData.bidSteps || auctionData.bidSteps.length === 0) {
                    // Fallback only if absolutely necessary, but user says they are defined
                    return val < 100 ? 5 : 20;
                }
                const stepObj = auctionData.bidSteps.find(s => val >= s.fromAmount && val <= s.toAmount);
                return stepObj ? stepObj.step : auctionData.bidSteps[auctionData.bidSteps.length - 1].step;
            };

            let currentPrice = itemData.currentBid || 0;
            if (sortedBids.length > 1) {
                const highest = sortedBids[0];
                const second = sortedBids[1];

                if (highest.isLiveAuction) {
                    // If the winner is a live bid, the price IS exactly that bid's amount
                    currentPrice = highest.maxAmount;
                } else {
                    // Regular proxy bidding: second highest + step
                    const step = getBidStep(second.maxAmount);
                    currentPrice = Math.min(second.maxAmount + step, highest.maxAmount);

                    // Special case: if highest is online but was pushed by a live bid,
                    // ensure the price reflects the live bid's full impact.
                    if (second.isLiveAuction) {
                        currentPrice = Math.min(second.maxAmount + step, highest.maxAmount);
                    }
                }
            } else if (sortedBids.length === 1) {
                const soloBid = sortedBids[0];
                if (soloBid.isLiveAuction) {
                    currentPrice = soloBid.maxAmount;
                } else {
                    currentPrice = itemData.startingPrice || itemData.currentBid || 0;
                }
            }

            // Update Item (Product or Collection)
            transaction.update(itemRef, {
                currentBid: currentPrice,
                hasBids: true
            });

            // Store new bid
            transaction.set(newBidDocRef, {
                ...newBidObj,
                isWinning: newBidId === winningBidId,
                currentAmount: newBidId === winningBidId ? currentPrice : maxAmount
            });

            // Update previous winner if changed
            const prevWinner = existingBids.find(b => b.isWinning);
            if (prevWinner && prevWinner.id !== newBidId) {
                transaction.update(bidsRef.doc(prevWinner.id), {
                    isWinning: prevWinner.id === winningBidId,
                    currentAmount: prevWinner.id === winningBidId ? currentPrice : prevWinner.maxAmount
                });
            }

            // Create notification for the bidder (only if it's not a live auction bid by admin)
            if (!isLiveAuction) {
                const notificationRef = db.collection("notifications").doc();
                const itemName = itemData.name ? (typeof itemData.name === 'string' ? itemData.name : itemData.name.en) : (itemData.title ? (typeof itemData.title === 'string' ? itemData.title : itemData.title.en) : "Item");
                const lotNum = itemData.lot || itemData.lotNumber || "";
                const auctionTitleSr = auctionData.title ? (typeof auctionData.title === 'string' ? auctionData.title : auctionData.title.sr) : "Aukcija";
                const auctionTitleEn = auctionData.title ? (typeof auctionData.title === 'string' ? auctionData.title : auctionData.title.en) : "Auction";

                transaction.set(notificationRef, {
                    userId: request.auth.uid,
                    type: "bid_placed",
                    title: "Uspešna ponuda",
                    titleEn: "Bid Placed",
                    description: `Postavili ste ponudu za Lot ${lotNum}: ${itemName} na aukciji ${auctionTitleSr}`,
                    descriptionEn: `You placed a bid on Lot ${lotNum}: ${itemName} in auction ${auctionTitleEn}`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    read: false,
                    productId: productId,
                    amount: maxAmount
                });
            }

            return { success: true, winning: newBidId === winningBidId, currentPrice };
        });
    } catch (error) {
        console.error("Error placing bid:", error);
        throw new HttpsError("internal", error.message);
    }
});
/**
 * updatePassword — callable function to update the authenticated user's password.
 */
exports.updatePassword = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError("unauthenticated", "User must be logged in to update password.");
    }

    const { newPassword } = request.data;
    if (!newPassword || newPassword.length < 8) {
        throw new HttpsError("invalid-argument", "New password must be at least 8 characters long.");
    }

    try {
        await admin.auth().updateUser(request.auth.uid, {
            password: newPassword
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating password:", error);
        throw new HttpsError("internal", error.message);
    }
});

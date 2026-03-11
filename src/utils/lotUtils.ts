/**
 * Logic for extracting numeric parts from lot strings, finding the maximum,
 * and returning the next one in "001" format.
 * Supports multiple arrays of lot numbers (rest parameter).
 */
export const getNextLotNumber = (...lotNumberArrays: (string | undefined | null)[][]): string => {
    const allExistingNumbers = lotNumberArrays.flat();
    const numericLots = allExistingNumbers
        .filter((lot): lot is string => !!lot && typeof lot === 'string')
        .map(lot => {
            const match = lot.match(/\d+/);
            return match ? parseInt(match[0], 10) : null;
        })
        .filter((n): n is number => n !== null);

    const maxLot = numericLots.length > 0 ? Math.max(...numericLots) : 0;
    const nextLot = maxLot + 1;

    return nextLot.toString();
};

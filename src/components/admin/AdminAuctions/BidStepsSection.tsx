import React from "react";
import { Plus, ChevronUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BidStep } from "@/contexts/DataContext";

export interface BidStepsSectionProps {
    language: "en" | "sr";
    stepsExpanded: boolean;
    setStepsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setLotsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setCollectionsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    bidSteps: BidStep[];
    setBidSteps: React.Dispatch<React.SetStateAction<BidStep[]>>;
    disabled?: boolean;
}

export const BidStepsSection: React.FC<BidStepsSectionProps> = ({
    language,
    stepsExpanded,
    setStepsExpanded,
    setLotsExpanded,
    setCollectionsExpanded,
    bidSteps,
    setBidSteps,
}) => {
    return (
        <div className="flex flex-col transition-all duration-300 ease-in-out">
            <button
                type="button"
                onClick={() => {
                    setStepsExpanded(!stepsExpanded);
                    if (!stepsExpanded) { setLotsExpanded(false); setCollectionsExpanded(false); }
                }}
                className={`flex items-center justify-between w-full p-3 border rounded-md hover:bg-muted/50 transition-all duration-300 cursor-pointer shrink-0 ${stepsExpanded ? "rounded-b-none border-b-0" : ""}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{language === "en" ? "Bid Steps" : "Koraci Licitacije"}</span>
                    <Badge className="bg-secondary text-white">
                        {bidSteps.length} {language === "en" ? "selected" : "izabrano"}
                    </Badge>
                </div>
                <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${stepsExpanded ? "rotate-0" : "rotate-180"}`} />
            </button>
            <div className={`border border-t-0 rounded-b-md transition-all duration-300 ease-in-out ${stepsExpanded ? "h-[min(520px,60vh)] overflow-hidden" : "max-h-0 opacity-0 overflow-hidden"}`}>
                <ScrollArea className={stepsExpanded ? "h-full" : "h-0"}>
                    <div className="p-4">
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground mb-3">
                                {language === "en"
                                    ? "Define bid increments for different price ranges. The step determines how much the bid increases."
                                    : "Definišite povećanje ponude za različite cenovne raspone. Korak određuje za koliko se ponuda povećava."}
                            </p>
                            {bidSteps.map((step, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">{language === "en" ? "From (€)" : "Od (€)"}</label>
                                            <Input type="number" min="0" value={step.fromAmount} onChange={(e) => { const s = [...bidSteps]; s[index].fromAmount = Number(e.target.value); setBidSteps(s); }} className="h-8 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">{language === "en" ? "To (€)" : "Do (€)"}</label>
                                            <Input type="number" min="0" value={step.toAmount === Infinity ? "" : step.toAmount} placeholder={step.toAmount === Infinity ? "∞" : ""} onChange={(e) => { const s = [...bidSteps]; s[index].toAmount = e.target.value === "" ? Infinity : Number(e.target.value); setBidSteps(s); }} className="h-8 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">{language === "en" ? "Step (€)" : "Korak (€)"}</label>
                                            <Input type="number" min="1" value={step.step} onChange={(e) => { const s = [...bidSteps]; s[index].step = Number(e.target.value); setBidSteps(s); }} className="h-8 text-sm" />
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setBidSteps(bidSteps.filter((_, i) => i !== index))} disabled={bidSteps.length <= 1}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => {
                                    const lastStep = bidSteps[bidSteps.length - 1];
                                    const newFromAmount = lastStep ? (lastStep.toAmount === Infinity ? lastStep.fromAmount + 1000 : lastStep.toAmount + 1) : 0;
                                    setBidSteps([...bidSteps, { fromAmount: newFromAmount, toAmount: Infinity, step: lastStep ? lastStep.step * 2 : 10 }]);
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {language === "en" ? "Add Step" : "Dodaj Korak"}
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

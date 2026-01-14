import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


interface ProgramVersion {
    id: string;
    name: string;
    updatedAt: Date;
    weeks: number;
    focus: string;
}

interface ComparisonProps {
    current: ProgramVersion;
    proposed: ProgramVersion;
}

export function ProgramComparisonView({ current, proposed }: ComparisonProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Current Version */}
            <Card className="border-l-4 border-l-gray-500">
                <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                        Current
                        <Badge variant="outline">v{current.id.slice(-4)}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Focus</p>
                            <p>{current.focus}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <p>{current.weeks} Weeks</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Proposed Version */}
            <Card className="border-l-4 border-l-emerald-500 bg-emerald-950/10">
                <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center text-emerald-400">
                        New Proposal
                        <Badge className="bg-emerald-500 text-black hover:bg-emerald-400">
                            Update
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Focus</p>
                            <div className="flex items-center gap-2">
                                <span className={current.focus !== proposed.focus ? "text-emerald-400 font-bold" : ""}>
                                    {proposed.focus}
                                </span>
                                {current.focus !== proposed.focus && (
                                    <Badge variant="secondary" className="text-xs">Changed</Badge>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <p>{proposed.weeks} Weeks</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

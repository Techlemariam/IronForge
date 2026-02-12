import { FactoryStatusData } from "@/actions/factory";
import { StatusCard } from "./StatusCard";

interface Props {
    data: FactoryStatusData[];
}

export function StatusGrid({ data }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.map((status) => (
                <StatusCard key={status.station} status={status} />
            ))}
        </div>
    );
}

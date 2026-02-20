import { FactoryStatusData } from "@/lib/schemas/factory";

import { StatusCard } from "./StatusCard";

interface Props {
    data: FactoryStatusData[];
}

/**
 * Component for rendering a grid of factory status cards.
 * Organizes cards into a responsive grid layout.
 * 
 * @param {Props} props - The component props.
 * @param {FactoryStatusData[]} props.data - Array of station status objects.
 */
export function StatusGrid({ data }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.map((status) => (
                <StatusCard key={status.station} status={status} />
            ))}
        </div>
    );
}

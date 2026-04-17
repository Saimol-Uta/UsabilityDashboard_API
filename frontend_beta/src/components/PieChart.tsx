interface PieChartProps {
    data: Array<{ label: string; value: number; color: string }>
    size?: number
}

export function PieChart({ data, size = 200 }: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) {
        return <div className="flex items-center justify-center h-48 text-slate-500">Sin datos</div>
    }

    // Filter to only items with value > 0
    const activeData = data.filter(d => d.value > 0)

    // DASH-02: Handle single data point — draw a full circle
    if (activeData.length === 1) {
        const item = activeData[0]
        return (
            <div className="flex flex-col items-center justify-center gap-3">
                <svg width={size} height={size} viewBox={`${-size / 2 - 20} ${-size / 2 - 20} ${size + 40} ${size + 40}`}>
                    <circle
                        cx={0}
                        cy={0}
                        r={size / 2}
                        fill={item.color}
                        className="transition-opacity hover:opacity-80 cursor-pointer"
                    />
                </svg>
                <span className="text-[12px] text-slate-500 font-medium">
                    Solo 1 categoría: {item.label} ({item.value})
                </span>
            </div>
        )
    }

    let currentAngle = -90
    const slices = data.map((item, idx) => {
        const sliceAngle = (item.value / total) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + sliceAngle
        
        const start = {
            x: Math.cos((startAngle * Math.PI) / 180) * (size / 2),
            y: Math.sin((startAngle * Math.PI) / 180) * (size / 2),
        }
        
        const end = {
            x: Math.cos((endAngle * Math.PI) / 180) * (size / 2),
            y: Math.sin((endAngle * Math.PI) / 180) * (size / 2),
        }
        
        const largeArc = sliceAngle > 180 ? 1 : 0
        const path = `M 0 0 L ${start.x} ${start.y} A ${size / 2} ${size / 2} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
        
        currentAngle = endAngle
        
        return { path, color: item.color, id: idx, value: item.value }
    })

    return (
        <div className="flex items-center justify-center">
            <svg width={size} height={size} viewBox={`${-size / 2 - 20} ${-size / 2 - 20} ${size + 40} ${size + 40}`}>
                {slices.filter(s => s.value > 0).map(slice => (
                    <path
                        key={slice.id}
                        d={slice.path}
                        fill={slice.color}
                        className="transition-opacity hover:opacity-80 cursor-pointer"
                    />
                ))}
            </svg>
        </div>
    )
}

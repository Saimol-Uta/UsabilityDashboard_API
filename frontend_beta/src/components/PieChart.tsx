interface PieChartProps {
    data: Array<{ label: string; value: number; color: string }>
    size?: number
}

export function PieChart({ data, size = 200 }: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) {
        return <div className="flex items-center justify-center h-48 text-slate-500">Sin datos</div>
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
        
        return { path, color: item.color, id: idx }
    })

    return (
        <div className="flex items-center justify-center">
            <svg width={size} height={size} viewBox={`${-size / 2 - 20} ${-size / 2 - 20} ${size + 40} ${size + 40}`}>
                {slices.map(slice => (
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

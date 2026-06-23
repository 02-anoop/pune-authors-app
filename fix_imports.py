with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Recharts imports to include RechartsPieChart and Pie
content = content.replace(
    "AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell",
    "AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RechartsPieChart, Pie"
)

# 2. Update the PieChart component to RechartsPieChart
content = content.replace("<PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>", "<RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>")
content = content.replace("</PieChart>", "</RechartsPieChart>")

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Imports fixed")

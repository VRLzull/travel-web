import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartData {
  month: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: ChartData[];
  loading?: boolean;
  height?: number;
  width?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export default function RevenueChart({
  data,
  loading = false,
  height = 300,
  width = 600,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
}: RevenueChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || loading || !data || data.length === 0) return;

    try {
      // Clear previous chart
      d3.select(svgRef.current).selectAll('*').remove();

      // Set up the chart dimensions
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create SVG
      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create scales
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.month))
        .range([0, innerWidth])
        .padding(0.2);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.revenue) || 0])
        .nice()
        .range([innerHeight, 0]);

      // Add X axis
      svg
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      svg.append('g').call(
        d3
          .axisLeft(y)
          .tickFormat((d) => `Rp. ${d3.format('.2s')(d as number)}`)
          .tickSizeOuter(0)
      );

      // Add bars
      svg
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.month) || 0)
        .attr('y', (d) => y(d.revenue))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerHeight - y(d.revenue))
        .attr('fill', '#4f46e5')
        .attr('rx', 2)
        .attr('ry', 2);

      // Add value labels
      svg
        .selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => (x(d.month) || 0) + x.bandwidth() / 2)
        .attr('y', (d) => y(d.revenue) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px'
        )
        .text((d) => (d.revenue > 0 ? `Rp. ${d3.format('.2s')(d.revenue)}` : ''));

    } catch (error) {
      console.error('Error rendering chart:', error);
    }
  }, [data, height, loading, margin.left, margin.right, margin.top, margin.bottom, width]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height, width }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height, width }}>
        Tidak ada data yang tersedia
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
}

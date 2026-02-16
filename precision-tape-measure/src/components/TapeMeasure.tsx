import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { UnitSystem, ImperialUnit, MetricUnit } from '../utils/conversions';

interface TapeMeasureProps {
  value: number; // In base units (inches for imperial, mm for metric)
  system: UnitSystem;
  unit: ImperialUnit | MetricUnit;
  precision: number; // Max denominator for imperial
}

export function TapeMeasure({ value, system, unit, precision }: TapeMeasureProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 200;

    // Create carbon fiber pattern
    const defs = svg.append('defs');
    
    const carbonPattern = defs.append('pattern')
      .attr('id', 'carbon-fiber')
      .attr('width', 10)
      .attr('height', 10)
      .attr('patternUnits', 'userSpaceOnUse');

    carbonPattern.append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', '#111');

    carbonPattern.append('path')
      .attr('d', 'M0,0 L5,5 M5,5 L10,0')
      .attr('stroke', '#222')
      .attr('stroke-width', 0.5);

    // Add glow filter for tick marks
    const glowFilter = defs.append('filter')
      .attr('id', 'glow');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', 2)
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#carbon-fiber)');

    // Determine scale and range based on unit
    let range: number;
    let tickGenerator: (scale: d3.ScaleLinear<number, number>) => void;

    if (system === 'imperial') {
      if (unit === 'feet') {
        range = Math.max(10, Math.ceil(value / 12) * 2);
        tickGenerator = generateFeetTicks;
      } else {
        range = Math.max(12, Math.ceil(value) * 2);
        tickGenerator = (scale) => generateInchTicks(scale, precision);
      }
    } else {
      if (unit === 'm') {
        range = Math.max(1, Math.ceil(value / 1000) * 2);
        tickGenerator = generateMeterTicks;
      } else if (unit === 'cm') {
        range = Math.max(100, Math.ceil(value / 10) * 20);
        tickGenerator = generateCmTicks;
      } else {
        range = Math.max(100, Math.ceil(value) * 2);
        tickGenerator = generateMmTicks;
      }
    }

    const scale = d3.scaleLinear()
      .domain([0, range])
      .range([50, width - 50]);

    // Render ticks
    tickGenerator(scale);

    // Indicator line
    const indicatorX = scale(system === 'imperial' && unit === 'inches' ? value : value);
    
    svg.append('line')
      .attr('x1', indicatorX)
      .attr('x2', indicatorX)
      .attr('y1', 20)
      .attr('y2', height - 20)
      .attr('stroke', '#ff006e')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut);

    // Indicator value label
    svg.append('text')
      .attr('x', indicatorX)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ff006e')
      .attr('font-size', '12px')
      .attr('font-family', 'JetBrains Mono')
      .attr('filter', 'url(#glow)')
      .text('▼');

    function generateInchTicks(scale: d3.ScaleLinear<number, number>, maxDenom: number) {
      const color = '#84cc16'; // Lime green for imperial
      const g = svg.append('g');

      for (let i = 0; i <= range; i++) {
        // Whole inch
        g.append('line')
          .attr('x1', scale(i))
          .attr('x2', scale(i))
          .attr('y1', height / 2 - 40)
          .attr('y2', height / 2 + 40)
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('filter', 'url(#glow)');

        g.append('text')
          .attr('x', scale(i))
          .attr('y', height / 2 + 55)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .attr('font-size', '10px')
          .attr('font-family', 'JetBrains Mono')
          .text(i);

        // Fractional ticks
        const fractions = [1/2, 1/4, 1/8, 1/16, 1/32, 1/64, 1/128];
        for (const frac of fractions) {
          if (1 / frac > maxDenom) continue;
          
          const heights = [35, 30, 25, 20, 15, 10, 7];
          const heightIndex = Math.log2(1 / frac) - 1;
          const tickHeight = heights[heightIndex] || 5;

          for (let j = 1; j < 1 / frac; j++) {
            const pos = i + j * frac;
            if (pos > range) break;

            g.append('line')
              .attr('x1', scale(pos))
              .attr('x2', scale(pos))
              .attr('y1', height / 2 - tickHeight)
              .attr('y2', height / 2 + tickHeight)
              .attr('stroke', color)
              .attr('stroke-width', 1)
              .attr('opacity', 0.7);
          }
        }
      }
    }

    function generateFeetTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#84cc16';
      const g = svg.append('g');

      for (let ft = 0; ft <= range; ft++) {
        g.append('line')
          .attr('x1', scale(ft))
          .attr('x2', scale(ft))
          .attr('y1', height / 2 - 45)
          .attr('y2', height / 2 + 45)
          .attr('stroke', color)
          .attr('stroke-width', 3)
          .attr('filter', 'url(#glow)');

        g.append('text')
          .attr('x', scale(ft))
          .attr('y', height / 2 + 60)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .attr('font-size', '12px')
          .attr('font-family', 'JetBrains Mono')
          .attr('font-weight', 'bold')
          .text(`${ft}'`);

        // Inch subdivisions within each foot
        for (let inch = 1; inch < 12; inch++) {
          g.append('line')
            .attr('x1', scale(ft + inch / 12))
            .attr('x2', scale(ft + inch / 12))
            .attr('y1', height / 2 - 25)
            .attr('y2', height / 2 + 25)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8);
        }
      }
    }

    function generateMmTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#06b6d4'; // Cyan for metric
      const g = svg.append('g');

      for (let i = 0; i <= range; i++) {
        const isCm = i % 10 === 0;
        const tickHeight = isCm ? 40 : 20;
        const strokeWidth = isCm ? 2 : 1;

        g.append('line')
          .attr('x1', scale(i))
          .attr('x2', scale(i))
          .attr('y1', height / 2 - tickHeight)
          .attr('y2', height / 2 + tickHeight)
          .attr('stroke', color)
          .attr('stroke-width', strokeWidth)
          .attr('filter', isCm ? 'url(#glow)' : 'none');

        if (isCm) {
          g.append('text')
            .attr('x', scale(i))
            .attr('y', height / 2 + 55)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono')
            .text(i / 10);
        }
      }
    }

    function generateCmTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#06b6d4';
      const g = svg.append('g');

      for (let i = 0; i <= range; i++) {
        const tickHeight = i % 10 === 0 ? 40 : 25;
        const strokeWidth = i % 10 === 0 ? 2 : 1;

        g.append('line')
          .attr('x1', scale(i))
          .attr('x2', scale(i))
          .attr('y1', height / 2 - tickHeight)
          .attr('y2', height / 2 + tickHeight)
          .attr('stroke', color)
          .attr('stroke-width', strokeWidth)
          .attr('filter', i % 10 === 0 ? 'url(#glow)' : 'none');

        if (i % 10 === 0) {
          g.append('text')
            .attr('x', scale(i))
            .attr('y', height / 2 + 55)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono')
            .text(i);
        }
      }
    }

    function generateMeterTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#06b6d4';
      const g = svg.append('g');

      for (let m = 0; m <= range; m++) {
        g.append('line')
          .attr('x1', scale(m))
          .attr('x2', scale(m))
          .attr('y1', height / 2 - 45)
          .attr('y2', height / 2 + 45)
          .attr('stroke', color)
          .attr('stroke-width', 3)
          .attr('filter', 'url(#glow)');

        g.append('text')
          .attr('x', scale(m))
          .attr('y', height / 2 + 60)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .attr('font-size', '12px')
          .attr('font-family', 'JetBrains Mono')
          .attr('font-weight', 'bold')
          .text(`${m}m`);

        // Decimeter subdivisions
        for (let dm = 1; dm < 10; dm++) {
          g.append('line')
            .attr('x1', scale(m + dm / 10))
            .attr('x2', scale(m + dm / 10))
            .attr('y1', height / 2 - 25)
            .attr('y2', height / 2 + 25)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8);
        }
      }
    }

  }, [value, system, unit, precision]);

  return (
    <div className="w-full h-[200px] border border-neutral-800 bg-black">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

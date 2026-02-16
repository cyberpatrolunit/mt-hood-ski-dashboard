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

    // Determine scale and range based on unit - zoom in on current value
    let viewRange: number;
    let centerValue: number;
    let tickGenerator: (scale: d3.ScaleLinear<number, number>) => void;

    if (system === 'imperial') {
      if (unit === 'feet') {
        viewRange = 4; // Show 4 feet at a time
        centerValue = value / 12; // Convert inches to feet for centering
        tickGenerator = generateFeetTicks;
      } else {
        // Zoom in based on precision - show fewer inches for finer precision
        viewRange = precision >= 64 ? 6 : precision >= 32 ? 8 : 12;
        centerValue = value;
        tickGenerator = (scale) => generateInchTicks(scale, precision);
      }
    } else {
      if (unit === 'm') {
        viewRange = 2; // Show 2 meters at a time
        centerValue = value / 1000;
        tickGenerator = generateMeterTicks;
      } else if (unit === 'cm') {
        viewRange = 50; // Show 50cm at a time
        centerValue = value / 10;
        tickGenerator = generateCmTicks;
      } else {
        viewRange = 200; // Show 200mm at a time
        centerValue = value;
        tickGenerator = generateMmTicks;
      }
    }

    // Center the scale on the current value
    const minDomain = Math.max(0, centerValue - viewRange / 2);
    const maxDomain = minDomain + viewRange;

    const scale = d3.scaleLinear()
      .domain([minDomain, maxDomain])
      .range([50, width - 50]);

    // Render ticks
    tickGenerator(scale);

    // Indicator line - calculate position based on unit
    let indicatorValue: number;
    if (system === 'imperial') {
      indicatorValue = unit === 'feet' ? value / 12 : value;
    } else {
      if (unit === 'cm') {
        indicatorValue = value / 10;
      } else if (unit === 'm') {
        indicatorValue = value / 1000;
      } else {
        indicatorValue = value;
      }
    }
    
    const indicatorX = scale(indicatorValue);
    
    // Indicator line with smooth transition
    const indicatorLine = svg.append('line')
      .attr('x1', indicatorX)
      .attr('x2', indicatorX)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#ff006e')
      .attr('stroke-width', 3)
      .attr('opacity', 0.9)
      .attr('filter', 'url(#glow)')
      .style('pointer-events', 'none');

    // Animate the indicator
    indicatorLine
      .transition()
      .duration(600)
      .ease(d3.easeCubicInOut);

    // Indicator top marker
    svg.append('polygon')
      .attr('points', `${indicatorX - 8},10 ${indicatorX + 8},10 ${indicatorX},25`)
      .attr('fill', '#ff006e')
      .attr('filter', 'url(#glow)')
      .style('pointer-events', 'none');

    // Indicator bottom marker
    svg.append('polygon')
      .attr('points', `${indicatorX - 8},${height - 10} ${indicatorX + 8},${height - 10} ${indicatorX},${height - 25}`)
      .attr('fill', '#ff006e')
      .attr('filter', 'url(#glow)')
      .style('pointer-events', 'none');

    function generateInchTicks(scale: d3.ScaleLinear<number, number>, maxDenom: number) {
      const color = '#84cc16'; // Lime green for imperial
      const g = svg.append('g');
      const [minVal, maxVal] = scale.domain();
      
      const startInch = Math.floor(minVal);
      const endInch = Math.ceil(maxVal);

      for (let i = startInch; i <= endInch; i++) {
        if (i < minVal || i > maxVal) continue;

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
            if (pos < minVal || pos > maxVal) continue;

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
      const [minVal, maxVal] = scale.domain();
      
      const startFt = Math.floor(minVal);
      const endFt = Math.ceil(maxVal);

      for (let ft = startFt; ft <= endFt; ft++) {
        if (ft < minVal || ft > maxVal) continue;

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
          const pos = ft + inch / 12;
          if (pos < minVal || pos > maxVal) continue;

          g.append('line')
            .attr('x1', scale(pos))
            .attr('x2', scale(pos))
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
      const [minVal, maxVal] = scale.domain();
      
      const startMm = Math.floor(minVal);
      const endMm = Math.ceil(maxVal);

      for (let i = startMm; i <= endMm; i++) {
        if (i < minVal || i > maxVal) continue;

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
      const [minVal, maxVal] = scale.domain();
      
      const startCm = Math.floor(minVal);
      const endCm = Math.ceil(maxVal);

      for (let i = startCm; i <= endCm; i++) {
        if (i < minVal || i > maxVal) continue;

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
      const [minVal, maxVal] = scale.domain();
      
      const startM = Math.floor(minVal);
      const endM = Math.ceil(maxVal);

      for (let m = startM; m <= endM; m++) {
        if (m < minVal || m > maxVal) continue;

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
          const pos = m + dm / 10;
          if (pos < minVal || pos > maxVal) continue;

          g.append('line')
            .attr('x1', scale(pos))
            .attr('x2', scale(pos))
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

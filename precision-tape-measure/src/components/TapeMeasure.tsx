import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { UnitSystem, ImperialUnit, MetricUnit } from '../utils/conversions';

interface TapeMeasureProps {
  value: number; // In base units (inches for imperial, mm for metric)
  system: UnitSystem;
  unit: ImperialUnit | MetricUnit;
  precision: number; // Max denominator for imperial
  zoom: number; // Zoom level (0.5 = zoomed out, 2 = zoomed in)
  onZoomChange: (zoom: number) => void;
}

export function TapeMeasure({ value, system, unit, precision, zoom, onZoomChange }: TapeMeasureProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle mouse wheel zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.5, Math.min(4, zoom + delta));
        onZoomChange(newZoom);
      }
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [zoom, onZoomChange]);

  // Handle touch pinch zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let initialDistance = 0;
    let initialZoom = zoom;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (initialDistance > 0) {
          const scale = distance / initialDistance;
          const newZoom = Math.max(0.5, Math.min(4, initialZoom * scale));
          onZoomChange(newZoom);
        }
      }
    };

    svg.addEventListener('touchstart', handleTouchStart);
    svg.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      svg.removeEventListener('touchstart', handleTouchStart);
      svg.removeEventListener('touchmove', handleTouchMove);
    };
  }, [zoom, onZoomChange]);

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

    // Background - pure black like reference
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#000');

    // Close-up view: tape slides under a fixed center indicator
    // Much tighter zoom for precision viewing
    let baseViewRange: number;
    let centerValue: number;
    let tickGenerator: (scale: d3.ScaleLinear<number, number>) => void;

    if (system === 'imperial') {
      if (unit === 'feet') {
        baseViewRange = 2; // Show 2 feet range at 1x zoom
        centerValue = value / 12; // Convert inches to feet for centering
        tickGenerator = generateFeetTicks;
      } else {
        // Very tight zoom based on precision - like looking at actual tape up close
        baseViewRange = precision >= 64 ? 2 : precision >= 32 ? 3 : 4;
        centerValue = value;
        tickGenerator = (scale) => generateInchTicks(scale, precision);
      }
    } else {
      if (unit === 'm') {
        baseViewRange = 0.5; // Show 0.5 meter range at 1x zoom
        centerValue = value / 1000;
        tickGenerator = generateMeterTicks;
      } else if (unit === 'cm') {
        baseViewRange = 20; // Show 20cm range at 1x zoom
        centerValue = value / 10;
        tickGenerator = generateCmTicks;
      } else {
        baseViewRange = 100; // Show 100mm range at 1x zoom
        centerValue = value;
        tickGenerator = generateMmTicks;
      }
    }

    // Apply zoom to view range (higher zoom = smaller range = more detail)
    const viewRange = baseViewRange / zoom;

    // Center the tape on the current value - tape slides under the fixed indicator
    const minDomain = Math.max(0, centerValue - viewRange / 2);
    const maxDomain = minDomain + viewRange;

    const scale = d3.scaleLinear()
      .domain([minDomain, maxDomain])
      .range([0, width]);

    // Render ticks on the sliding tape
    tickGenerator(scale);

    // Fixed indicator in center - tape slides underneath
    const centerX = width / 2;
    const indicatorColor = '#e91e63'; // Bright pink like reference
    
    // Indicator line (fixed in center)
    svg.append('line')
      .attr('x1', centerX)
      .attr('x2', centerX)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', indicatorColor)
      .attr('stroke-width', 4)
      .attr('opacity', 0.95)
      .attr('filter', 'url(#glow)')
      .style('pointer-events', 'none');

    // Top indicator marker - triangle pointing down
    svg.append('polygon')
      .attr('points', `${centerX - 15},10 ${centerX + 15},10 ${centerX},30`)
      .attr('fill', indicatorColor)
      .attr('filter', 'url(#glow)')
      .style('pointer-events', 'none');

    // Bottom indicator marker - rounded pill shape like reference
    svg.append('ellipse')
      .attr('cx', centerX)
      .attr('cy', height - 20)
      .attr('rx', 18)
      .attr('ry', 12)
      .attr('fill', indicatorColor)
      .attr('filter', 'url(#glow)')
      .style('pointer-events', 'none');

    function generateInchTicks(scale: d3.ScaleLinear<number, number>, maxDenom: number) {
      const color = '#a4d63e'; // Bright lime green like reference
      const g = svg.append('g')
        .attr('class', 'tape-ticks');
      
      const [minVal, maxVal] = scale.domain();
      const startInch = Math.floor(minVal);
      const endInch = Math.ceil(maxVal);
      const centerY = height / 2;

      for (let i = startInch; i <= endInch; i++) {
        if (i < minVal || i > maxVal) continue;

        const x = scale(i);

        // Whole inch - tallest ticks extending inward from edges
        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', 80)
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', height)
          .attr('y2', height - 80)
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

        // Number label in center
        g.append('text')
          .attr('x', x)
          .attr('y', centerY + 8)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .attr('font-size', '40px')
          .attr('font-family', 'JetBrains Mono')
          .attr('font-weight', 'bold')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
          .text(i);

        // Fractional ticks with proper heights
        const fractions = [
          { frac: 1/2, height: 65 },
          { frac: 1/4, height: 50 },
          { frac: 1/8, height: 38 },
          { frac: 1/16, height: 28 },
          { frac: 1/32, height: 20 },
          { frac: 1/64, height: 15 },
          { frac: 1/128, height: 10 },
        ];

        for (const { frac, height: tickHeight } of fractions) {
          if (1 / frac > maxDenom) continue;
          
          for (let j = 1; j < 1 / frac; j++) {
            const pos = i + j * frac;
            if (pos < minVal || pos > maxVal) continue;

            const xPos = scale(pos);
            const opacity = tickHeight > 30 ? 0.9 : 0.7;
            const strokeWidth = tickHeight > 40 ? 2 : 1.5;

            // Upper tick - extends inward from top
            g.append('line')
              .attr('x1', xPos)
              .attr('x2', xPos)
              .attr('y1', 0)
              .attr('y2', tickHeight)
              .attr('stroke', color)
              .attr('stroke-width', strokeWidth)
              .attr('stroke-linecap', 'round')
              .attr('opacity', opacity)
              .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

            // Lower tick - extends inward from bottom
            g.append('line')
              .attr('x1', xPos)
              .attr('x2', xPos)
              .attr('y1', height)
              .attr('y2', height - tickHeight)
              .attr('stroke', color)
              .attr('stroke-width', strokeWidth)
              .attr('stroke-linecap', 'round')
              .attr('opacity', opacity)
              .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');
          }
        }
      }
    }

    function generateFeetTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#a4d63e';
      const g = svg.append('g').attr('class', 'tape-ticks');
      const [minVal, maxVal] = scale.domain();
      const centerY = height / 2;
      
      const startFt = Math.floor(minVal);
      const endFt = Math.ceil(maxVal);

      for (let ft = startFt; ft <= endFt; ft++) {
        if (ft < minVal || ft > maxVal) continue;

        const x = scale(ft);

        // Foot marks - tallest, extend inward from edges
        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', 80)
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', height)
          .attr('y2', height - 80)
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

        g.append('text')
          .attr('x', x)
          .attr('y', centerY + 8)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .attr('font-size', '40px')
          .attr('font-family', 'JetBrains Mono')
          .attr('font-weight', 'bold')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
          .text(`${ft}'`);

        // Inch subdivisions within each foot
        for (let inch = 1; inch < 12; inch++) {
          const pos = ft + inch / 12;
          if (pos < minVal || pos > maxVal) continue;

          const xPos = scale(pos);
          const tickHeight = inch % 6 === 0 ? 50 : inch % 3 === 0 ? 38 : 28;
          const strokeWidth = inch % 6 === 0 ? 2 : 1.5;

          g.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', 0)
            .attr('y2', tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.8)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', height)
            .attr('y2', height - tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.8)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');
        }
      }
    }

    function generateMmTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#06b6d4'; // Cyan for metric
      const g = svg.append('g').attr('class', 'tape-ticks');
      const [minVal, maxVal] = scale.domain();
      const centerY = height / 2;
      
      const startMm = Math.floor(minVal);
      const endMm = Math.ceil(maxVal);

      for (let i = startMm; i <= endMm; i++) {
        if (i < minVal || i > maxVal) continue;

        const x = scale(i);
        const isCm = i % 10 === 0;
        const is5mm = i % 5 === 0;

        if (isCm) {
          // Centimeter marks - tallest, extend inward from edges
          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', 80)
            .attr('stroke', color)
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', height)
            .attr('y2', height - 80)
            .attr('stroke', color)
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('text')
            .attr('x', x)
            .attr('y', centerY + 8)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .attr('font-size', '40px')
            .attr('font-family', 'JetBrains Mono')
            .attr('font-weight', 'bold')
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
            .text(i / 10);
        } else if (is5mm) {
          // 5mm marks - medium
          const tickHeight = 50;
          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.9)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', height)
            .attr('y2', height - tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.9)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');
        } else {
          // 1mm marks - shortest
          const tickHeight = 28;
          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.7)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', height)
            .attr('y2', height - tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.7)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');
        }
      }
    }

    function generateCmTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#06b6d4';
      const g = svg.append('g').attr('class', 'tape-ticks');
      const [minVal, maxVal] = scale.domain();
      const centerY = height / 2;
      
      const startCm = Math.floor(minVal);
      const endCm = Math.ceil(maxVal);

      for (let i = startCm; i <= endCm; i++) {
        if (i < minVal || i > maxVal) continue;

        const x = scale(i);
        const is10cm = i % 10 === 0;
        const is5cm = i % 5 === 0;

        if (is10cm) {
          // 10cm marks - tallest, extend inward from edges
          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', 80)
            .attr('stroke', color)
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', height)
            .attr('y2', height - 80)
            .attr('stroke', color)
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('text')
            .attr('x', x)
            .attr('y', centerY + 8)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .attr('font-size', '40px')
            .attr('font-family', 'JetBrains Mono')
            .attr('font-weight', 'bold')
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
            .text(i);
        } else if (is5cm) {
          // 5cm marks - medium
          const tickHeight = 50;
          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.9)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', height)
            .attr('y2', height - tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.9)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');
        } else {
          // 1cm marks - shortest
          const tickHeight = 35;
          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.7)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', height)
            .attr('y2', height - tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.7)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');
        }
      }
    }

    function generateMeterTicks(scale: d3.ScaleLinear<number, number>) {
      const color = '#06b6d4';
      const g = svg.append('g').attr('class', 'tape-ticks');
      const [minVal, maxVal] = scale.domain();
      const centerY = height / 2;
      
      const startM = Math.floor(minVal);
      const endM = Math.ceil(maxVal);

      for (let m = startM; m <= endM; m++) {
        if (m < minVal || m > maxVal) continue;

        const x = scale(m);

        // Meter marks - tallest, extend inward from edges
        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', 80)
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', height)
          .attr('y2', height - 80)
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

        g.append('text')
          .attr('x', x)
          .attr('y', centerY + 8)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .attr('font-size', '40px')
          .attr('font-family', 'JetBrains Mono')
          .attr('font-weight', 'bold')
          .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
          .text(`${m}m`);

        // Decimeter subdivisions
        for (let dm = 1; dm < 10; dm++) {
          const pos = m + dm / 10;
          if (pos < minVal || pos > maxVal) continue;

          const xPos = scale(pos);
          const tickHeight = dm % 5 === 0 ? 50 : 35;
          const strokeWidth = dm % 5 === 0 ? 2 : 1.5;

          g.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', 0)
            .attr('y2', tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.8)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');

          g.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', height)
            .attr('y2', height - tickHeight)
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.8)
            .style('transition', 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)');
        }
      }
    }

  }, [value, system, unit, precision, zoom]);

  return (
    <div className="w-full h-[200px] border border-neutral-800 bg-black">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import HeatMap from "@uiw/react-heat-map";

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const getPanelColors = (maxCount) => {
  const safeMax = Math.max(maxCount, 1);
  return {
    0: 'rgba(60, 73, 77, 0.3)',
    [Math.ceil(safeMax * 0.25)]: 'rgba(175, 236, 255, 0.2)',
    [Math.ceil(safeMax * 0.5)]:  'rgba(175, 236, 255, 0.5)',
    [Math.ceil(safeMax * 0.75)]: 'rgba(175, 236, 255, 0.8)',
    [safeMax]: '#afecff',
  };
};

const HeatMapProfile = ({ repositories = [] }) => {
  const [activityData, setActivityData] = useState([]);
  const [panelColors, setPanelColors]   = useState({});

  const [tooltip, setTooltip] = useState(null); // { text, x, y }
  const containerRef = useRef(null);

  useEffect(() => {
    const map = {};

    repositories.forEach(repo => {
      if (repo.createdAt) {
        const d = new Date(repo.createdAt).toISOString().split('T')[0];
        map[d] = (map[d] || 0) + 1;
      }
      if (repo.commits && Array.isArray(repo.commits)) {
        repo.commits.forEach(commit => {
          if (commit.timestamp) {
            const d = new Date(commit.timestamp).toISOString().split('T')[0];
            map[d] = (map[d] || 0) + 1;
          }
        });
      }
    });

    const data = Object.keys(map).map(date => ({ date, count: map[date] }));
    setActivityData(data);
    const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
    setPanelColors(getPanelColors(maxCount));
  }, [repositories]);

  const currentYear = new Date().getFullYear();

  const handleRectEnter = (e, count, date) => {
    const label = count > 0
      ? `${count} contribution${count !== 1 ? 's' : ''} · ${formatDate(date)}`
      : date ? `No contributions · ${formatDate(date)}` : 'No contributions';

    const rect  = containerRef.current?.getBoundingClientRect();
    const tRect = e.currentTarget.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      text: label,
      x: tRect.left - rect.left + tRect.width / 2,
      y: tRect.top  - rect.top,
    });
  };

  return (
    <div ref={containerRef} className="w-full overflow-x-auto custom-scrollbar pb-md pt-5" style={{ position: 'relative' }}>
      <HeatMap
        className="HeatMapProfile"
        style={{ width: "100%", minWidth: "750px", color: "#e4e1e9" }}
        value={activityData}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        monthLabels={MONTHS}
        startDate={new Date(`${currentYear}-01-01`)}
        rectSize={12}
        space={3}
        rectProps={{ rx: 2 }}
        panelColors={panelColors}
        rectRender={(props, data) => {
          const count = data.count || 0;
          const date  = data.date  || "";

          const { key, ...restProps } = props;

          return (
            <rect
              key={key}
              {...restProps}
              style={{ cursor: count > 0 ? 'pointer' : 'default', transition: 'opacity 0.15s' }}
              onMouseEnter={(e) => handleRectEnter(e, count, date)}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        }}
      />

      {/* Floating tooltip rendered outside SVG */}
      {tooltip && (
        <div
          style={{
            position:  'absolute',
            left:      tooltip.x,
            top:       tooltip.y - 36,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          <div style={{
            background:   '#1c2128',
            border:       '1px solid rgba(48,54,61,0.9)',
            borderRadius: '6px',
            padding:      '4px 10px',
            fontSize:     '11px',
            color:        '#e4e1e9',
            whiteSpace:   'nowrap',
            boxShadow:    '0 4px 14px rgba(0,0,0,0.5)',
          }}>
            {tooltip.text}
          </div>
          {/* Arrow */}
          <div style={{
            width:        0,
            height:       0,
            borderLeft:   '5px solid transparent',
            borderRight:  '5px solid transparent',
            borderTop:    '5px solid rgba(48,54,61,0.9)',
            margin:       '0 auto',
          }} />
        </div>
      )}
    </div>
  );
};

export default HeatMapProfile;

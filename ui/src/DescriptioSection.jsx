import { useState } from "react";

function DescriptionSection({ description, isMobileScreen }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 200;
  const shouldCollapse = isLong && isMobileScreen; // only collapse on mobile

  return (
    <div style={{
      marginTop: "20px",
      padding: "16px",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      border: "1px solid #eee",
    }}>
      <strong style={{ fontSize: "20px", color: "#111" }}>Description</strong>
      <p style={{
        marginTop: "10px",
        lineHeight: "1.8",
        color: "#444",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontSize: "14px",
        overflow: "hidden",
        maxHeight: expanded || !shouldCollapse ? "none" : "80px",
      }}>
        {description}
      </p>
      {shouldCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: "8px",
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            padding: "0",
            fontSize: "14px",
          }}
        >
          {expanded ? "Show less ▲" : "Read more ▼"}
        </button>
      )}
    </div>
  );
}

export default DescriptionSection;
export default function LevelSlider({ label, leftLabel, rightLabel, max, value, onChange }) {
  return (
    <label className="slider">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="slider-ends">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </span>
    </label>
  );
}

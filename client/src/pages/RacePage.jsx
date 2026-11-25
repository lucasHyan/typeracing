import Race from "../components/Race.jsx";

export default function RacePage(props) {
  const raceStartTime = props.race?.startTime || null;
  const targetText = props.race?.targetText || props.room?.targetText || "";

  return (
    <Race
      key={`${props.room?.code}-${raceStartTime || targetText}-${props.room?.status}`}
      {...props}
    />
  );
}

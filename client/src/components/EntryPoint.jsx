import { useState } from "react";
import Candidate from "./candidate/Candidate.jsx";
import Employer from "./employer/Employer";

const EntryPoint = () => {
  const [isCandidate, setIsCandidate] = useState(true);
  return (
    <div>
      <button onClick={() => setIsCandidate(!isCandidate)}>
        {isCandidate ? "Interviewer" : "Candidate"}
      </button>
      {isCandidate ? <Candidate /> : <Employer />}
    </div>
  );
};

export default EntryPoint;

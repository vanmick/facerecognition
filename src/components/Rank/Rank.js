import React from "react";

const Rank = ({ name, entries }) => {
  return (
    <div>
      <div className="white f3 blue">
        {`${name}, your current entry count is...`}
      </div>
      <div className="white f1 blue">{entries}</div>
    </div>
  );
};

export default Rank;

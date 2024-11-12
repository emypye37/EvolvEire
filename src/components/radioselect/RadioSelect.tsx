import React, { useState, ChangeEvent } from 'react';
import './RadioSelect.css';

type OptionType = 'railways' | 'stations' | 'railwaysStations';

const RadioSelector: React.FC = () => {
  // Initialize state with TypeScript type annotation for the selected option
  const [selectedOption, setSelectedOption] = useState<OptionType>('railwaysStations');

  // TypeScript type annotation for the event parameter
  const handleOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value as OptionType);
  };

  return (
    <form>
      <div className="radio">
        <label>
          <input
            type="radio"
            name="selection"
            value="railways"
            checked={selectedOption === 'railways'}
            onChange={handleOptionChange}
          />
          Railways only
        </label>
      </div>
      <div className="radio">
        <label>
          <input
            type="radio"
            name="selection"
            value="stations"
            checked={selectedOption === 'stations'}
            onChange={handleOptionChange}
          />
          Stations only
        </label>
      </div>
      <div className="radio">
        <label>
          <input
            type="radio"
            name="selection"
            value="railwaysStations"
            checked={selectedOption === 'railwaysStations'}
            onChange={handleOptionChange}
          />
          Railways & Stations
        </label>
      </div>
    </form>
  );
};

export default RadioSelector;

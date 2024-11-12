import * as React from "react";
import "./ControlPanel.css";
import RadioSelect from "./../radioselect/RadioSelect";

//typescript props
interface ControlPanelProps {
  onChange: (year: string) => void;
  selectedYear: number;
}

//controlled component
const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedYear,
  onChange,
}) => {
  return (
    <div className='control-panel'>
      <h3>Explore Routes by Year</h3>
      <div key={"year"} className='input'>
        <input
          type='range'
          value={selectedYear}
          min={1846}
          max={2024}
          step={1}
          //handleYearChange is called from MyMap which limits the slider to the specific data years
          onChange={(evt) => onChange(evt.target.value)}
        />
      </div>

      <div className='slider-labels'>
        <div className='label'>{selectedYear}</div>
      </div>
      {/* <RadioSelect></RadioSelect> */}
    </div>
  );
};

export default ControlPanel;

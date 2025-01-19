import { useState, useEffect } from 'react';
import './App.css';
import Methodology from './Methodology';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ChartDataLabels);

// Register components with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const initialFormData = {
  electricity: {
    existingCarbonFreeElectricity: '',
    existingFossilFuelElectricity: '',
    currentWindCapacityGW: '',
    currentSolarCapacityGW: ''
  },
  heat: {
    residentialHeat: '',
    industryHeat: '',
  },
  roadTransport: {
    cars: { numVehicles: '', distance: '', kWhPerKm: 0.19, totalElectricity: 0 },
    busesSmall: { numVehicles: '', distance: '', kWhPerKm: 0.23, totalElectricity: 0 },
    busesLarge: { numVehicles: '', distance: '', kWhPerKm: 4.63, totalElectricity: 0 },
    lightGoods: { numVehicles: '', distance: '', kWhPerKm: 0.23, totalElectricity: 0 },
    heavyGoods: { numVehicles: '', distance: '', kWhPerKm: 4.63, totalElectricity: 0 },
    tractors: { numVehicles: '', distance: '', kWhPerKm: 4.63, totalElectricity: 0 },
    motorcycles: { numVehicles: '', distance: '', kWhPerKm: 0.11, totalElectricity: 0 },
    other: { numVehicles: '', distance: '', kWhPerKm: 0.23, totalElectricity: 0 },
  },
  railDiesel: ''
};

function App() {
  // State to hold form inputs and country selection
  const [formData, setFormData] = useState(initialFormData);

  const [activeTab, setActiveTab] = useState('electricity'); // State to track the active tab
  const [selectedCountry, setSelectedCountry] = useState("Ireland"); // Pre-select Ireland

  const [showMethodology, setShowMethodology] = useState(false); // State for showing Methodology
  const [newGrid, setNewGrid] = useState({}); // State for storing new grid calculation
  const [turbineCapacityMW, setTurbineCapacityMW] = useState(6.6); // Average Turbine Capacity
  const [windCapacityFactor, setWindCapacityFactor] = useState(34); // Wind Capacity Factor in %
  const [solarCapacityFactor, setSolarCapacityFactor] = useState(11); // Solar Capacity Factor in %
  const [windSolarRatio, setWindSolarRatio] = useState(90); // Default to 90% wind

 // Automatically set Ireland's data on page load
 useEffect(() => {
  console.log("in useEffect selectedCountry");
  if (selectedCountry && defaultData[selectedCountry]) {
    setFormData((prev) => ({
      ...defaultData[selectedCountry],
      roadTransport: calculateTotalElectricity(defaultData[selectedCountry].roadTransport),
    }));
  }
}, [selectedCountry]);


  // Automatic recalculation with useEffect
  useEffect(() => {
    console.log("in big useEffect");
    const roadTransportTotal = Object.values(formData.roadTransport).reduce((acc, curr) => {
      return acc + (curr.numVehicles && curr.distance ? curr.numVehicles * curr.distance * curr.kWhPerKm / 1e9 : 0);
    }, 0);


    // Constants
    const dieselEnergyContent = 11.9; // kWh per liter
    const dieselEngineEfficiency = 0.45; // 45% efficient
    const electricLocomotiveEfficiency = 0.73; // 73% efficient
    const transmissionLoss = 0.10; // 10% loss in electricity transmission

    // Input: Diesel consumption in millions of liters
    const railDieselMillionLiters = formData.railDiesel;
    // Step 1: Convert diesel to total energy (GWh)
    const totalDieselEnergyGWh = railDieselMillionLiters * dieselEnergyContent / 1000000; // Convert to GW
    // Step 2: Calculate useful work from diesel
    const usefulWorkGWh = totalDieselEnergyGWh * dieselEngineEfficiency;
    // Step 3: Calculate electricity required (before losses)
    const electricityRequiredGWh = usefulWorkGWh / electricLocomotiveEfficiency;
    // Step 4: Account for transmission losses
    const electricityRequiredWithLossesGWh = electricityRequiredGWh / (1 - transmissionLoss);
    // Step 5: Convert GWh to TWh
    const electricityRequiredRailTWh = electricityRequiredWithLossesGWh / 1000;



    const residentialHeat = formData.heat.residentialHeat ? parseFloat(formData.heat.residentialHeat) / 4 : 0;
    const industryHeat = formData.heat.industryHeat ? parseFloat(formData.heat.industryHeat) : 0;

    const newGridSize =
      // parseFloat(formData.electricity.existingCarbonFreeElectricity || 0) +
      parseFloat(formData.electricity.existingFossilFuelElectricity || 0) +
      residentialHeat +
      industryHeat +
      roadTransportTotal + 
      electricityRequiredRailTWh;


    //if (newGridSize) {
      const { extraWindCapacityGW, numTurbines, extraSolarCapacityGW, numSolarPanels } = calculateWindAndSolar(newGridSize);
      setNewGrid({
        total: newGridSize,
        heat: residentialHeat + industryHeat,
        roadTransport: roadTransportTotal,
        electricityRequiredRailTWh: electricityRequiredRailTWh,
        extraWindCapacityGW,
        numTurbines,
        extraSolarCapacityGW,
        numSolarPanels,
        existingCarbonFreeElectricity: formData.electricity.existingCarbonFreeElectricity,
        existingFossilFuelElectricity: formData.electricity.existingFossilFuelElectricity,
        currentWindCapacityGW: formData.electricity.currentWindCapacityGW,
        currentSolarCapacityGW: formData.electricity.currentSolarCapacityGW,        
      });
    //}
  }, [formData, turbineCapacityMW, windCapacityFactor, solarCapacityFactor, windSolarRatio]);



  const handleParameterChange = (setter, value) => {
  
    setter(value);
  };

  const Tooltip = ({ text }) => {
    return (
      <div className="tooltip">
        <img
          src="https://img.icons8.com/material-outlined/24/info.png" // Modern "info" icon
          alt="info"
          style={{
            marginLeft: "5px",
            cursor: "pointer",
          }}
        />
        <span className="tooltip-text">{text}</span>
      </div>
    );
  };

  const defaultData = {
    Ireland: {
      electricity: {
        existingCarbonFreeElectricity: 12.63,
        existingFossilFuelElectricity: 21.25,
        currentWindCapacityGW: 5.585, // Current wind capacity in GW
        currentSolarCapacityGW: 1.185, // Current solar capacity in GW
      },
      heat: {
       residentialHeat:  36.08,
       industryHeat: 19.88
      },
      windSolarRatio: 90, // Default 90% Wind, 10% Solar
      roadTransport: {
        cars: { numVehicles: 2255971, distance: 16352, kWhPerKm: 0.19, totalElectricity: 0 },
        busesSmall: { numVehicles: 21457, distance: 39504, kWhPerKm: 0.23, totalElectricity: 0 },
        busesLarge: { numVehicles: 11206, distance: 34965, kWhPerKm: 4.63, totalElectricity: 0 },
        lightGoods: { numVehicles: 220056, distance: 20615, kWhPerKm: 0.23, totalElectricity: 0 },
        heavyGoods: { numVehicles: 146704, distance: 20615, kWhPerKm: 4.63, totalElectricity: 0 },
        tractors: { numVehicles: 84170, distance: 2000, kWhPerKm: 4.63, totalElectricity: 0 },
        motorcycles: { numVehicles: 41471, distance: 2741, kWhPerKm: 0.11, totalElectricity: 0 },
        other: { numVehicles: 101676, distance: 20391, kWhPerKm: 0.23, totalElectricity: 0 },
      },
      railDiesel: 43800000
    },
  };

  // Calculate total electricity for all roadTransport categories
  const calculateTotalElectricity = (roadTransportData) => {
    const updatedTransport = {};
    Object.keys(roadTransportData).forEach((category) => {
      const { numVehicles, distance, kWhPerKm } = roadTransportData[category];
      let totalElectricity = numVehicles && distance ? numVehicles * distance * kWhPerKm / 1000000000 : 0;
      totalElectricity = totalElectricity * 1.1;
      updatedTransport[category] = {
        ...roadTransportData[category],
        totalElectricity: totalElectricity
      };
    });
    return updatedTransport;
  };

  //Handle country selection
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    console.log("country is ", country);
    if (defaultData[country]) {
      const updatedTransport = calculateTotalElectricity(defaultData[country].roadTransport);
      setFormData({ ...defaultData[country] });
    } else {
      setFormData(initialFormData);
      setNewGrid({});
    }
  };

    // Unified input handler
    const handleChange = (e, category, field, subField) => {

      const value = e.target.value; // The new value from the input field
      console.log("In handleChange: value = ", value, " category = ", category, " field = ", field);
    
      
      setFormData((prev) => {
        if (subField) {
          // Nested fields (e.g., roadTransport.cars.numVehicles)
          return {
            ...prev,
            [category]: {
              ...prev[category],
              [field]: {
                ...prev[category][field],
                [subField]: value, // Update the specific subField
              },
            },
          };
        } else if (field){
          // Top-level fields (e.g., electricity.existingCarbonFreeElectricity)
          return {
            ...prev,
            [field]: {
              ...prev[field],
              [category]: value, // Update the specific category
            },
          };
        } else {
          return {
            ...prev,
            [category]: value, // Update the specific category
          
          };
        }
      });
    };
    

  // Calculate wind and solar requirements
  const calculateWindAndSolar = (totalElectricityToBeGreened, existingRenewableElectricity) => {
    console.log("in calculateWindAndSolar, totalElectricityToBeGreened is ", totalElectricityToBeGreened);
    // console.log("totalElectricity is ", totalElectricity);
    const windSplit = windSolarRatio / 100; // Convert percentage to fraction
    const solarSplit = 1 - windSplit; // Complement for solar
    const hoursPerYear = 8760; // Total hours in a year
  
    // console.log("windCapacityFactor in TWH is ", windCapacityFactor);
  
    // Constants for solar panels
    const panelCapacityKW = 0.4; // 400W panel
    const solarCapacityFactorDecimal = solarCapacityFactor / 100;

    console.log(">>> solarCapacityFactorDecimal is ", solarCapacityFactorDecimal);
  
    // Calculate AEP for wind and solar
    const windTurbineAEP =
      (turbineCapacityMW * (windCapacityFactor / 100) * hoursPerYear) / 1000000; // in TWh per turbine
    const solarPanelAEP =
      (panelCapacityKW * solarCapacityFactorDecimal * hoursPerYear) / 1000000; // in TWh per panel
  
    // console.log("windTurbineAEP is ", windTurbineAEP);
    // console.log("solarPanelAEP is ", solarPanelAEP);
  
    // Calculate the total electricity split
    const windElectricity = totalElectricityToBeGreened * windSplit;
    const solarElectricity = totalElectricityToBeGreened * solarSplit;

    console.log(">>>> solarElectricity is ", solarElectricity);

    // console.log("windElectricity is ", windElectricity);
    // console.log("solarElectricity is ", solarElectricity);
  
    // Calculate the number of turbines and solar MW needed
    const numTurbines = Math.ceil(windElectricity / windTurbineAEP);
    
    const extraWindCapacityGW = (numTurbines * turbineCapacityMW) / 1000; // Convert MW to GW
  
    
  
    // Calculate the number of solar panels
    const solarElectricityKWh = solarElectricity * 1e9; // Convert TWh to kWh
    console.log(">>> solarElectricityKWh is ", solarElectricityKWh);
    const panelOutputKWh = panelCapacityKW * solarCapacityFactorDecimal * hoursPerYear; // kWh per panel annually

    console.log(">>> panelOutputKWh is ", panelOutputKWh);

    const numSolarPanels = Math.ceil(solarElectricityKWh / panelOutputKWh);
  
    // console.log("numSolarPanels is ", numSolarPanels);

    const extraSolarCapacityGW = (numSolarPanels * panelCapacityKW / 1000000); // GW of solar capacity needed

    // console.log("extraSolarCapacityGW is ", extraSolarCapacityGW);
  
    return { extraWindCapacityGW, numTurbines, extraSolarCapacityGW, numSolarPanels };
  };
  
  const processedData = {
    labels: ['Existing Grid', 'Required Grid (Fossil-Free)'],
    datasets: [
      {
        label: 'Existing Renewable Electricity',
        data: [
          newGrid.existingCarbonFreeElectricity
            ? newGrid.existingCarbonFreeElectricity
            : 0,
          newGrid.existingCarbonFreeElectricity
            ? newGrid.existingCarbonFreeElectricity
            : 0,
        ],
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Existing Carbon-Powered Electricity',
        data: [
          newGrid.existingFossilFuelElectricity
            ? newGrid.existingFossilFuelElectricity
            : 0,
            0
        ],
        backgroundColor: '#d1d1e0',
      },
      {
        label: 'Existing Fossil Fuel Electricity Converted To Renewable',
        data: [
          0,
          newGrid.existingFossilFuelElectricity
            ? newGrid.existingFossilFuelElectricity
            : 0,
        ],
        backgroundColor: '#8BC34A',
      },
      {
        label: 'Electricity for Road Transport',
        data: [
          0,
          newGrid.roadTransport
            ? parseFloat(newGrid.roadTransport.toFixed(2))
            : 0,
        ],
        backgroundColor: '#CDDC39',
      },
      {
        label: 'Electricity for Rail',
        data: [
          0,
          newGrid.electricityRequiredRailTWh
            ? parseFloat(newGrid.electricityRequiredRailTWh.toFixed(2))
            : 0,
        ],
        backgroundColor: '#CDDC39',
      },
      {
        label: 'Electricity for Heat',
        data: [
          0,
          newGrid.heat ? parseFloat(newGrid.heat.toFixed(2)) : 0,
        ],
        backgroundColor: '#FFEB3B',
      },
    ].filter(dataset => dataset.data.some(value => value > 0)), // Include only datasets with values > 0
  };

  console.log("newGrid.electricityRequiredRailTWh is ", newGrid.electricityRequiredRailTWh);

  return (
    <div className="App">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#F3F4F6', // Light background for the header section
          borderBottom: '2px solid #E0E0E0', // Add a subtle border
        }}
      >
        <h1
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '2.5rem',
            color: '#007BFF', // Highlighted color
            margin: '0',
          }}
        >
          <span
            style={{
              marginRight: '10px',
            }}
          >
            🌬️
          </span>
          Wind and Solar Calculator
          <span
            style={{
              marginLeft: '10px',
            }}
          >
            ☀️
          </span>

          <div
      style={{
        textAlign: '',
        color: '#007BFF', // Bright blue for emphasis
        fontSize: '0.9rem',
        fontWeight: 'bold',
        margin: '20px 5px',
        maxWidth: '600px', // Optional, for a nice width
      }}
    >
      This app estimates the number of wind turbines and solar panels needed to fully phase out fossil fuels in a country.
    </div>
        </h1>
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          style={{
            padding: '10px',
            backgroundColor: '#007BFF',
            color: '#FFF',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Methodology
        </button>
      </div>


      {showMethodology && <Methodology />}






      <div className="country-dropdown-container">
        <label htmlFor="country-select" className="dropdown-label">Select Country or enter your own data for a country:</label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={handleCountryChange}
          className="country-dropdown"
        >
          <option value="Ireland">Ireland</option>
          <option value="">No Country</option>
        </select>
      </div>



      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '20px',
          width: '100%',
          maxWidth: '100vw', // Ensures full viewport width
          boxSizing: 'border-box', // Includes padding and borders in width calculations
        }}
      >
            <div
              style={{
                flex: '1 1 calc(24% - 20px)', // Allows three panels per row
                minWidth: '250px', // Reduced for better responsiveness
                padding: '15px',
                border: '1px solid #4CAF50', // Green border for renewable energy
                borderRadius: '5px',
                background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', // Green gradient
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img
                  src="https://img.icons8.com/fluency/48/wind-turbine.png" // Wind turbine icon
                  alt="Renewable Electricity"
                  style={{ marginRight: '10px' }}
                />
                <h3 style={{ color: '#4CAF50', margin: 0 }}>Carbon-Free Electricity

                <Tooltip text="Enter the current amount of renewables and nuclear generated electricity the country produces in a year" />
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', alignItems: 'center', gap: '10px' }}>
                <label style={{ textAlign: 'right', marginRight: '10px' }}>
                  Current Carbon-Free Electricity per annum (TWh):
                </label>
                <input
                  type="number"
                  value={formData.electricity.existingCarbonFreeElectricity}
                  onChange={(e) => handleChange(e, 'existingCarbonFreeElectricity', 'electricity')}
                  style={{
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #CCC',
                    maxWidth: '120px',
                    boxSizing: 'border-box',
                  }}
                />

                <label style={{ textAlign: 'right', marginRight: '10px' }}>
                  Current Wind Capacity (GW):
                </label>
                <input
                  type="number"
                  value={formData.electricity.currentWindCapacityGW}
                  onChange={(e) => handleChange(e, 'currentWindCapacityGW', 'electricity')}
                  style={{
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #CCC',
                    maxWidth: '120px',
                    boxSizing: 'border-box',
                  }}
                />
                <label style={{ textAlign: 'right', marginRight: '10px' }}>
                  Current Solar Capacity (GW):
                </label>
                <input
                  type="number"
                  value={formData.electricity.currentSolarCapacityGW}
                  onChange={(e) => handleChange(e, 'currentSolarCapacityGW', 'electricity')}
                  style={{
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #CCC',
                    maxWidth: '120px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>


        {/* Electricity Input */}
        <div
          style={{
            flex: '1 1 calc(24% - 20px)', // Allows three panels per row
            minWidth: '250px', // Reduced for better responsiveness
            padding: '15px',
            border: '1px solid #757575', // Medium gray border for carbon-powered panels
            borderRadius: '5px',
            backgroundColor: '#F5F5F5', // Light gray background for consistency
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <img
              src="https://img.icons8.com/fluency/48/electricity.png"
              alt="Electricity"
              style={{ marginRight: '10px' }}
            />
            <h3 style={{ color: '#616161', margin: 0 }}>Carbon-Powered Electricity <Tooltip text="Enter the current amount of fossil fuel generated electricity the country produces in a year" /></h3> {/* Dark gray text */}

            
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '10fr 1fr', alignItems: 'center', gap: '10px' }}>
            <label style={{ textAlign: 'right', marginRight: '10px', color: '#424242', display: 'flex', alignItems: 'center' }}> {/* Slightly darker gray */}
              Carbon-Powdered Electricity Per Annum (TWh):

            </label>
            <input
              type="number"
              value={formData.electricity.existingFossilFuelElectricity}
              onChange={(e) => handleChange(e, 'existingFossilFuelElectricity', 'electricity')}
              style={{
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #CCC',
                maxWidth: '120px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>


        {/* Heat Input */}
        <div
  style={{
    flex: '1 1 calc(24% - 20px)', // Allows three panels per row
    minWidth: '250px', // Reduced for better responsiveness
    padding: '15px',
    border: '1px solid #757575', // Medium gray border for carbon-powered panels
    borderRadius: '5px',
    backgroundColor: '#F5F5F5', // Light gray background for consistency
    boxSizing: 'border-box',
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
    <img
      src="https://img.icons8.com/fluency/48/fire-element.png" // Updated fire icon
      alt="Heat"
      style={{ marginRight: '10px' }}
      height="48px"
      width="48px"
    />
    <h3 style={{ color: '#616161', margin: 0 }}>Carbon-Powered Heat
    <Tooltip text="Enter the current amount of heat generated by fossil fuels the country uses in a year" />
      </h3> {/* Dark gray text */}
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', alignItems: 'center', gap: '10px' }}>
    <label style={{ textAlign: 'right', marginRight: '10px', color: '#424242' }}> {/* Slightly darker gray */}
      Home/Office Heating Per Annum (TWh):
    </label>
    <input
      type="number"
      value={formData.heat.residentialHeat}
      onChange={(e) => handleChange(e, 'residentialHeat', 'heat')}
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #CCC',
        maxWidth: '120px',
        boxSizing: 'border-box',
      }}
    />
    <label style={{ textAlign: 'right', marginRight: '10px', color: '#424242' }}> {/* Slightly darker gray */}
       Industry Heat Per Annum (TWh):
    </label>
    <input
      type="number"
      value={formData.heat.industryHeat}
      onChange={(e) => handleChange(e, 'industryHeat', 'heat')}
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #CCC',
        maxWidth: '120px',
        boxSizing: 'border-box',
      }}
    />
  </div>
</div>

        {/* Rail Input */}
        {/* <div
  style={{
    flex: '1 1 calc(24% - 20px)', // Allows three panels per row
    minWidth: '250px', // Reduced for better responsiveness
    padding: '15px',
    border: '1px solid #757575', // Medium gray border for carbon-powered panels
    borderRadius: '5px',
    backgroundColor: '#F5F5F5', // Light gray background for consistency
    boxSizing: 'border-box',
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
    <img
      width="48"
      height="48"
      src="https://img.icons8.com/emoji/48/high-speed-train-emoji.png"
      alt="high-speed-train"
      style={{ marginRight: '10px' }}
    />
    <h3 style={{ color: '#616161', margin: 0 }}>Carbon-Powered Rail</h3> {/* Dark gray text 
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center', gap: '10px' }}>
    <label style={{ textAlign: 'right', marginRight: '10px', color: '#424242' }}> {/* Slightly darker gray }
      Diesel Fuel Used (litres):
    </label>
    <input
      type="number"
      value={formData.railDiesel}
      onChange={(e) => handleChange(e, 'railDiesel')}
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #CCC',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    />
  </div>
</div> */}

          {/* Transport Inputs */}
          <div
  style={{
    width: '100%', // Full width of the parent container
    padding: '15px',
    border: '1px solid #757575', // Dark gray border for industrial feel
    borderRadius: '5px',
    backgroundColor: '#F5F5F5', // Light gray for fossil fuel association
    boxSizing: 'border-box', // Ensures padding is included in width
  }}
>

<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
    <img
      width="48"
      height="48"
      src="https://img.icons8.com/emoji/48/high-speed-train-emoji.png"
      alt="high-speed-train"
      style={{ marginRight: '10px' }}
    />
    <h3 style={{ color: '#616161', margin: 0 }}>Carbon-Powered Rail
    <Tooltip text="Enter the current amount of litres of diesel a country uses to power its rail network in a year" />
      </h3> {/* Dark gray text */}
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center', gap: '10px' }}>
    <label style={{ textAlign: 'right', marginRight: '10px', color: '#424242' }}> {/* Slightly darker gray */}
      Diesel Fuel Used (litres):
    </label>
    <input
      type="number"
      value={formData.railDiesel}
      onChange={(e) => handleChange(e, 'railDiesel')}
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #CCC',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    />
  </div>

  <table
    style={{
      width: '100%', // Full width of the roadTransport panel
      borderCollapse: 'collapse',
      textAlign: 'left',
    }}
  >
    <thead>
      <tr>
        <th style={{ borderBottom: '2px solid #BDBDBD', padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0px' }}>
            <img
              src="https://img.icons8.com/fluency/48/car.png"
              alt="Transport"
              style={{ marginRight: '10px' }}
            />
            <h3 style={{ color: '#616161', margin: 0 }}>Carbon-Powered Road Transport
            <Tooltip text="Enter the current number of vehicles in the country and the average distance each type travels in a year" />
              </h3> {/* Dark gray text */}
          </div>
        </th>
        <th style={{ borderBottom: '2px solid #BDBDBD', padding: '10px', color: '#616161' }}> {/* Dark gray text */}
          Number of Vehicles
        </th>
        <th style={{ borderBottom: '2px solid #BDBDBD', padding: '10px', color: '#616161' }}> {/* Dark gray text */}
          Average Distance (km)
        </th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(formData.roadTransport).map((category) => (
        <tr key={category}>
          <td style={{ padding: '10px', fontWeight: 'bold', color: '#424242' }}> {/* Slightly darker gray */}
            {category === 'cars'
              ? 'Cars'
              : category === 'busesSmall'
              ? 'Buses Small'
              : category === 'busesLarge'
              ? 'Buses Large'
              : category === 'lightGoods'
              ? 'Light Goods Vehicles'
              : category === 'heavyGoods'
              ? 'Heavy Goods Vehicles'
              : category === 'tractors'
              ? 'Tractors'
              : category === 'motorcycles'
              ? 'Motorcycles'
              : category === 'other'
              ? 'Other Vehicles'
              : ''}
          </td>
          <td style={{ padding: '10px' }}>
            <input
              type="number"
              value={formData.roadTransport[category].numVehicles}
              onChange={(e) => handleChange(e, 'roadTransport', category, 'numVehicles')}
              style={{
                width: '100%',
                padding: '5px',
                borderRadius: '5px',
                border: '1px solid #BDBDBD',
              }}
            />
          </td>
          <td style={{ padding: '10px' }}>
            <input
              type="number"
              value={formData.roadTransport[category].distance}
              onChange={(e) => handleChange(e, 'roadTransport', category, 'distance')}
              style={{
                width: '100%',
                padding: '5px',
                borderRadius: '5px',
                border: '1px solid #BDBDBD',
              }}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>



      </div>



      

      



        <div>

          {/* Left Panel: Controls */}
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h2>Controls</h2>
              <label>
                  Wind-Solar Ratio: {windSolarRatio}% Wind / {100 - windSolarRatio}% Solar
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={windSolarRatio}
                    onChange={(e) => {
                      setWindSolarRatio(Number(e.target.value));
                      if (newGrid) {
                        const { extraWindCapacityGW, numTurbines, extraSolarCapacityGW, numSolarPanels } = calculateWindAndSolar(newGrid.total);
                        setNewGrid((prev) => ({ ...prev, extraWindCapacityGW, numTurbines, extraSolarCapacityGW, numSolarPanels }));
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                </label>

                <label>
                  Average Turbine Capacity (MW):
                  <input
                    type="number"
                    value={turbineCapacityMW}
                    onChange={(e) => handleParameterChange(setTurbineCapacityMW, parseFloat(e.target.value))}
                  />
                </label>
                <label style={{ marginLeft: '20px' }}>
                  Wind Capacity Factor (%) <Tooltip text="The wind capacity factor is the ratio of the actual energy output of a wind turbine over a period of time (e.g., a year) to the maximum possible energy it could produce if it operated at full capacity 100% of the time" />:
                  <input
                    type="number"
                    value={windCapacityFactor}
                    onChange={(e) => handleParameterChange(setWindCapacityFactor, parseFloat(e.target.value))}
                  />
                </label>
                <label style={{ marginLeft: '20px' }}>
                  Solar Capacity Factor (%):
                  <input
                    type="number"
                    value={solarCapacityFactor}
                    onChange={(e) => handleParameterChange(setSolarCapacityFactor, parseFloat(e.target.value))}
                  />
                </label>
            </div>



            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '20px' }}>
              {/* Grid Comparison - Chart */}
              <div style={{ flex: '5', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h2>Grid Comparison</h2>

                <Bar
                  data={processedData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          font: {
                            size: 12,
                            weight: 'bold',
                          },
                        },
                      },
                      datalabels: {
                        display: false, // Disable data labels on the bars
                      },
                    },
                    scales: {
                      x: { stacked: true },
                      y: {
                        stacked: true,
                        title: {
                          display: true,
                          text: 'TWh',
                          font: { size: 14 },
                          color: '#000',
                        },
                        ticks: {
                          beginAtZero: true,
                          stepSize: 10,
                        },
                      },
                    },
                    layout: {
                      padding: {
                        top: 20,
                      },
                    },
                  }}
                  plugins={[ChartDataLabels]}
                />
             {/* Display Totals */}
              <div style={{ marginTop: '20px' }}>
            <h3>Totals</h3>
            <p>
              <strong>Existing Grid (Fossil-Free):</strong>{" "}
              {processedData?.datasets[0]?.data[0]}
              TWh
            </p>
            <p>
              <strong>Existing Grid:</strong>{" "}
              {processedData?.datasets
                ?.reduce((acc, dataset) => acc + (dataset?.data?.[0] || 0), 0) // Sum data[0] across all datasets
                .toFixed(2)}{" "}
              TWh
            </p>
            <p>
              <strong>Required Grid (Fossil-Free):</strong>{" "}
              {processedData?.datasets
                ?.reduce((acc, dataset) => acc + (dataset?.data?.[1] || 0), 0) // Sum data[1] across all datasets
                .toFixed(2)}{" "}
              TWh
            </p>
          </div>


              </div>

              {/* Required Infrastructure */}
              <div style={{ flex: '5', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h3>Required Infrastructure</h3>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
                {/* Wind Section */}
                <div
                  style={{
                    flex: '1',
                    padding: '15px',
                    border: '1px solid #4CAF50',
                    borderRadius: '5px',
                    backgroundColor: '#E8F5E9',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src="https://img.icons8.com/fluency/48/wind-turbine.png"
                    alt="Wind Turbine"
                    style={{ marginBottom: '10px' }}
                  />
                  <h4 style={{ color: '#4CAF50' }}>Wind Energy</h4>
                  <p>
                    <strong>Extra Capacity:</strong> {newGrid.extraWindCapacityGW ? newGrid.extraWindCapacityGW.toFixed(2) : "N/A"} GW

                  </p>
                  <p>
                  <strong>Extra Turbines:</strong> {newGrid.numTurbines !== undefined ? newGrid.numTurbines.toLocaleString() : "N/A"}

                  </p>
                </div>

                {/* Solar Section */}
                <div
                  style={{
                    flex: '1',
                    padding: '15px',
                    border: '1px solid #FFC107',
                    borderRadius: '5px',
                    backgroundColor: '#FFF8E1',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src="https://img.icons8.com/fluency/48/solar-panel.png"
                    alt="Solar Panel"
                    style={{ marginBottom: '10px' }}
                  />
                  <h4 style={{ color: '#FFC107' }}>Solar Energy</h4>
                  <p>
                    <strong>Extra Capacity:</strong> {newGrid.extraSolarCapacityGW ? newGrid.extraSolarCapacityGW.toFixed(2) : "N/A"} GW
                  </p>
                  <p>
                  <strong>Extra Panels:</strong> {newGrid.numSolarPanels !== undefined ? newGrid.numSolarPanels.toLocaleString() : "N/A"}

                  </p>
                </div>
              </div>


                {/* {console.log('Current Wind Capacity (GW):', defaultData.Ireland.currentWindCapacityGW)}
                {console.log('Extra Wind Capacity (GW):', newGrid.extraWindCapacityGW)}
                {console.log('Total Wind Capacity (GW):', defaultData.Ireland.currentWindCapacityGW + newGrid.extraWindCapacityGW)}
                {console.log('Current Solar Capacity (GW):', defaultData.Ireland.currentSolarCapacityGW)}
                {console.log('Extra Solar Capacity (GW):', newGrid.extraSolarCapacityGW)}
                {console.log('Total Solar Capacity (GW):', defaultData.Ireland.currentSolarCapacityGW + newGrid.extraSolarCapacityGW)}
 */}

                {/* New Chart */}
                <div>
                  <h3>Current vs Needed Capacity</h3>
<Bar
  data={{
    labels: ['Wind Capacity (GW)', 'Solar Capacity (GW)'],
    datasets: [
      {
        label: 'Current Capacity',
        data: [newGrid.currentWindCapacityGW, newGrid.currentSolarCapacityGW],
        backgroundColor: ['#2196F3', '#FFD700'], // Light Blue for wind, Light Yellow for solar
        datalabels: {
          color: ['#FFFFFF', '#000000'], // White text for Wind, Black text for Solar
          anchor: 'center',
          align: 'center',
          formatter: (value, context) => {
          
            const numericValue = Number(value); // Convert to a number
            return !isNaN(numericValue)
              ? `Current Capacity: ${numericValue.toFixed(2)}`
              : '';
          }
        },
      },
      {
        label: 'Extra Capacity Needed',
        data: [newGrid.extraWindCapacityGW, newGrid.extraSolarCapacityGW],
        backgroundColor: ['#0D47A1', '#FFC107'], // Dark Blue for wind, Dark Yellow for solar
        datalabels: {
          color: ['#FFFFFF', '#000000'], // White text for Wind, Black text for Solar
          anchor: 'center',
          align: 'center',
          formatter: (value, context) => {
            const numericValue = Number(value); // Convert to a number

            return !isNaN(numericValue)
            ? `Extra Needed: ${numericValue.toFixed(2)}`
            : '';
          }
        },
      },
    ],
  }}
  options={{
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true, // Enable labels for each stack section
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
    scales: {
      x: { stacked: true }, // Enable stacked bars on x-axis
      y: {
        stacked: true, // Enable stacked bars on y-axis
        title: {
          display: true,
          text: 'Capacity (GW)', // Label for the y-axis
        },
        ticks: {
          precision: 0, // Ensure y-axis shows whole numbers
        },
      },
    },
  }}
  plugins={[ChartDataLabels]} // Include the DataLabels plugin
/>



                </div>
              </div>


            </div>

        </div>
        
    
    </div>
  );
}

export default App;

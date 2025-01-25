import { useState, useEffect } from "react";
import "./App.css";
import Methodology from "./Methodology";
import Contact from "./Contact";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ChartDataLabels);

// Register components with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,

  Legend
);

const gasEmissionsElectricityPerKWH = 490;
const gasEmissionsHeatPerKWH = 185;
const emissionsPerLitreDiesel = 2680;
const emissionsWindPerKWH = 11;

const initialFormData = {
  electricity: {
    existingCarbonFreeElectricity: "",
    existingFossilFuelElectricity: "",
    currentWindCapacityGW: "",
    currentSolarCapacityGW: "",
    lowDemandGW: "",
    lowDemandDuringDayGW: "",
  },
  heat: {
    residentialHeat: "",
    industryHeat: "",
  },
  roadTransport: {
    cars: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.19,
      totalElectricity: 0,
      emissionsPerKm: 130,
    },
    busesSmall: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.23,
      totalElectricity: 0,
      emissionsPerKm: 153,
    },
    busesLarge: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 4.63,
      totalElectricity: 0,
      emissionsPerKm: 822,
    },
    lightGoods: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.23,
      totalElectricity: 0,
      emissionsPerKm: 193,
    },
    heavyGoods: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 4.63,
      totalElectricity: 0,
      emissionsPerKm: 1045,
    },
    tractors: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 4.63,
      totalElectricity: 0,
      emissionsPerKm: 1045,
    },
    motorcycles: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.11,
      totalElectricity: 0,
      emissionsPerKm: 113,
    },
    other: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.23,
      totalElectricity: 0,
      emissionsPerKm: 193,
    },
  },
  railDiesel: "",
  shippingDiesel: "",
};

function App() {
  // State to hold form inputs and country selection
  const [formData, setFormData] = useState(initialFormData);

  const [activeTab, setActiveTab] = useState("electricity"); // State to track the active tab
  const [selectedCountry, setSelectedCountry] = useState("Ireland"); // Pre-select Ireland

  const [showMethodology, setShowMethodology] = useState(false); // State for showing Methodology
  const [showContact, setShowContact] = useState(false); // State for showing Contact
  const [newGrid, setNewGrid] = useState({}); // State for storing new grid calculation
  const [turbineCapacityMW, setTurbineCapacityMW] = useState(6.6); // Average Turbine Capacity
  const [windCapacityFactor, setWindCapacityFactor] = useState(34); // Wind Capacity Factor in %
  const [solarCapacityFactor, setSolarCapacityFactor] = useState(11); // Solar Capacity Factor in %
  const [windSolarRatio, setWindSolarRatio] = useState(90); // Default to 90% wind
  const [storageDuration, setStorageDuration] = useState(1);
  const [lakeHeightDifference, setLakeHeightDifference] = useState(150);
  const [includeStorage, setIncludeStorage] = useState(false);

  // Automatically set Ireland's data on page load
  useEffect(() => {
    if (selectedCountry && defaultData[selectedCountry]) {
      setFormData((prev) => ({
        ...defaultData[selectedCountry],
        roadTransport: calculateTotalElectricity(
          defaultData[selectedCountry].roadTransport
        ),
      }));
    }
  }, [selectedCountry]);

  // Automatic recalculation with useEffect
  useEffect(() => {
    const roadTransportTotal = Object.values(formData.roadTransport).reduce(
      (acc, curr) => {
        return (
          acc +
          (curr.numVehicles && curr.distance
            ? (curr.numVehicles * curr.distance * curr.kWhPerKm) / 1e9
            : 0)
        );
      },
      0
    );

    let roadTransportEmissionsTotal = Object.values(
      formData.roadTransport
    ).reduce((acc, curr) => {
      return (
        acc +
        (curr.numVehicles && curr.distance
          ? curr.numVehicles * curr.distance * curr.emissionsPerKm
          : 0)
      );
    }, 0);

    roadTransportEmissionsTotal =
      roadTransportEmissionsTotal / 1000000 / 1000000;

    // Rail
    const dieselEnergyContent = 11.9; // kWh per liter
    const dieselEngineEfficiency = 0.45; // 45% efficient
    const electricLocomotiveEfficiency = 0.73; // 73% efficient
    const transmissionLoss = 0.1; // 10% loss in electricity transmission

    // Input: Diesel consumption in millions of liters
    const railDieselMillionLiters = formData.railDiesel;
    // Step 1: Convert diesel to total energy (GWh)
    const totalDieselEnergyGWh =
      (railDieselMillionLiters * dieselEnergyContent) / 1000000; // Convert to GW
    // Step 2: Calculate useful work from diesel
    const usefulWorkGWh = totalDieselEnergyGWh * dieselEngineEfficiency;
    // Step 3: Calculate electricity required (before losses)
    const electricityRequiredGWh = usefulWorkGWh / electricLocomotiveEfficiency;
    // Step 4: Account for transmission losses
    const electricityRequiredWithLossesGWh =
      electricityRequiredGWh / (1 - transmissionLoss);
    // Step 5: Convert GWh to TWh
    const electricityRequiredRailTWh = electricityRequiredWithLossesGWh / 1000;

    // Shipping
    const diselInKg = formData.shippingDiesel
      ? parseFloat(formData.shippingDiesel * 0.84)
      : 0;

    const shippingTWh = (diselInKg * 12.75) / 1000000000;

    const usefulWorkInTWh = shippingTWh * 0.38;
    const kgOfHydrogenNeeded = (usefulWorkInTWh * 1000000000) / 15;
    const electricityNeededShipping = (kgOfHydrogenNeeded * 52.5) / 1000000000;

    const residentialHeat = formData.heat.residentialHeat
      ? parseFloat(formData.heat.residentialHeat) / 4
      : 0;
    const industryHeat = formData.heat.industryHeat
      ? parseFloat(formData.heat.industryHeat)
      : 0;

    const newGridSize =
      // parseFloat(formData.electricity.existingCarbonFreeElectricity || 0) +
      parseFloat(formData.electricity.existingFossilFuelElectricity || 0) +
      residentialHeat +
      industryHeat +
      roadTransportTotal +
      electricityRequiredRailTWh +
      electricityNeededShipping;

    // emisions shipping
    const shippingEmissions =
      ((formData.shippingDiesel || 0) * emissionsPerLitreDiesel) /
      // convert to tonnes
      1000000 /
      // convert to millions
      1000000;

    // rail emisions
    const railEmissions =
      ((formData.railDiesel || 0) * emissionsPerLitreDiesel) /
      // convert to tonnes
      1000000 /
      // convert to millions
      1000000;

    // electricity emisisons
    let existingElectricityEmissions =
      ((formData.electricity.existingFossilFuelElectricity || 0) *
        1000000000 *
        gasEmissionsElectricityPerKWH) /
      // convert to tonnes
      1000000 /
      // convert to millions
      1000000;

    existingElectricityEmissions =
      existingElectricityEmissions +
      ((formData.electricity.existingCarbonFreeElectricity || 0) *
        1000000000 *
        emissionsWindPerKWH) /
        // convert to tonnes
        1000000 /
        // convert to millions
        1000000;

    console.log(
      "existingElectricityEmissions is ",
      existingElectricityEmissions
    );

    // heat emissions
    const existingHeatEmissions =
      ((formData.heat.residentialHeatn || 0) *
        1000000000 *
        gasEmissionsHeatPerKWH +
        (formData.heat.industryHeat || 0) *
          1000000000 *
          gasEmissionsHeatPerKWH) /
      // convert to tonnes
      1000000 /
      // convert to millions
      1000000;

    // new grid heat emissions
    const newGridEmissions =
      ((newGridSize + formData.electricity.existingCarbonFreeElectricity) *
        1000000000 *
        emissionsWindPerKWH) /
      // convert to tonnes
      1000000 /
      // convert to millions
      1000000;

    console.log("newGridEmissions is ", newGridEmissions);

    //if (newGridSize) {
    const {
      extraWindCapacityGW,
      numTurbines,
      extraSolarCapacityGW,
      numSolarPanels,
      volumeOfWater,
      totalEnergyOfNewGrid,
    } = calculateWindAndSolar(
      newGridSize,
      formData.electricity.existingCarbonFreeElectricity,
      parseFloat(formData.electricity.existingFossilFuelElectricity || 0)
    );

    setNewGrid({
      total: newGridSize,
      heat: residentialHeat + industryHeat,
      roadTransport: roadTransportTotal,
      electricityRequiredRailTWh: electricityRequiredRailTWh,
      electricityNeededShipping: electricityNeededShipping,
      extraWindCapacityGW,
      numTurbines,
      extraSolarCapacityGW,
      numSolarPanels,
      existingCarbonFreeElectricity:
        formData.electricity.existingCarbonFreeElectricity,
      existingFossilFuelElectricity:
        formData.electricity.existingFossilFuelElectricity,
      currentWindCapacityGW: formData.electricity.currentWindCapacityGW,
      currentSolarCapacityGW: formData.electricity.currentSolarCapacityGW,
      volumeOfWater: volumeOfWater,
      totalEnergyOfNewGrid: totalEnergyOfNewGrid,
      roadTransportEmissionsTotal: roadTransportEmissionsTotal,
      railEmissions: railEmissions,
      shippingEmissions: shippingEmissions,
      existingElectricityEmissions: existingElectricityEmissions,
      existingHeatEmissions: existingHeatEmissions,
      newGridEmissions: newGridEmissions,
    });
    //}
  }, [
    formData,
    turbineCapacityMW,
    windCapacityFactor,
    solarCapacityFactor,
    windSolarRatio,
    storageDuration,
    includeStorage,
    lakeHeightDifference,
  ]);

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
        lowDemandGW: 2.5,
        lowDemandDuringDayGW: 4.5,
      },
      heat: {
        residentialHeat: 36.08,
        industryHeat: 19.88,
      },
      windSolarRatio: 90, // Default 90% Wind, 10% Solar
      roadTransport: {
        cars: {
          numVehicles: 2255971,
          distance: 16352,
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 130,
        },
        busesSmall: {
          numVehicles: 21457,
          distance: 39504,
          kWhPerKm: 0.23,
          totalElectricity: 0,
          emissionsPerKm: 153,
        },
        busesLarge: {
          numVehicles: 11206,
          distance: 34965,
          kWhPerKm: 4.63,
          totalElectricity: 0,
          emissionsPerKm: 822,
        },
        lightGoods: {
          numVehicles: 220056,
          distance: 20615,
          kWhPerKm: 0.23,
          totalElectricity: 0,
          emissionsPerKm: 193,
        },
        heavyGoods: {
          numVehicles: 146704,
          distance: 20615,
          kWhPerKm: 4.63,
          totalElectricity: 0,
          emissionsPerKm: 1045,
        },
        tractors: {
          numVehicles: 84170,
          distance: 2000,
          kWhPerKm: 4.63,
          totalElectricity: 0,
          emissionsPerKm: 1045,
        },
        motorcycles: {
          numVehicles: 41471,
          distance: 2741,
          kWhPerKm: 0.11,
          totalElectricity: 0,
          emissionsPerKm: 113,
        },
        other: {
          numVehicles: 101676,
          distance: 20391,
          kWhPerKm: 0.23,
          totalElectricity: 0,
          emissionsPerKm: 193,
        },
      },
      railDiesel: 43800000,
      shippingDiesel: 107376283,
    },
  };

  // Calculate total electricity for all roadTransport categories
  const calculateTotalElectricity = (roadTransportData) => {
    const updatedTransport = {};
    Object.keys(roadTransportData).forEach((category) => {
      const { numVehicles, distance, kWhPerKm } = roadTransportData[category];
      let totalElectricity =
        numVehicles && distance
          ? (numVehicles * distance * kWhPerKm) / 1000000000
          : 0;
      totalElectricity = totalElectricity * 1.1;
      updatedTransport[category] = {
        ...roadTransportData[category],
        totalElectricity: totalElectricity,
      };
    });
    return updatedTransport;
  };

  const handleClearCountry = () => {
    setSelectedCountry(""); // Set selected country to "No Country"
    setFormData(initialFormData); // Reset form data to initial state
    setNewGrid({}); // Clear the new grid
    setIncludeStorage(false);
  };

  //Handle country selection
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);

    if (defaultData[country]) {
      const updatedTransport = calculateTotalElectricity(
        defaultData[country].roadTransport
      );
      setFormData({ ...defaultData[country] });
    } else {
      setFormData(initialFormData);
      setNewGrid({});
    }
  };

  // Unified input handler
  const handleChange = (e, category, field, subField) => {
    const value = e.target.value; // The new value from the input field

    setFormData((prev) => {
      if (subField) {
        // Nested fields (e.g., roadTransport.cars.numVehicles)
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [field]: {
              ...prev[category][field],
              [subField]: parseFloat(value) || 0, // Update the specific subField
            },
          },
        };
      } else if (field) {
        // Top-level fields (e.g., electricity.existingCarbonFreeElectricity)
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [category]: parseFloat(value) || 0, // Update the specific category
          },
        };
      } else {
        return {
          ...prev,
          [category]: parseFloat(value) || 0, // Update the specific category
        };
      }
    });
  };

  // Calculate wind and solar requirements
  const calculateWindAndSolar = (
    totalElectricityToBeGreened,
    existingRenewableElectricity,
    existingFossilFuelElectricity,
    roadTransportEmissionsTotal,
    railEmissions,
    shippingEmissions
  ) => {
    const totalEnergyOfNewGrid =
      (totalElectricityToBeGreened || 0) +
      parseFloat(existingRenewableElectricity || 0);

    const windSplit = windSolarRatio / 100; // Convert percentage to fraction
    const solarSplit = 1 - windSplit; // Complement for solar
    const hoursPerYear = 8760; // Total hours in a year

    // Constants for solar panels
    const panelCapacityKW = 0.4; // 400W panel
    const solarCapacityFactorDecimal = solarCapacityFactor / 100;

    // Calculate AEP for wind and solar
    const windTurbineAEP =
      (turbineCapacityMW * (windCapacityFactor / 100) * hoursPerYear) / 1000000; // in TWh per turbine
    const solarPanelAEP =
      (panelCapacityKW * solarCapacityFactorDecimal * hoursPerYear) / 1000000; // in TWh per panel

    // Calculate the total electricity split
    const windElectricity = totalElectricityToBeGreened * windSplit;
    const solarElectricity = totalElectricityToBeGreened * solarSplit;

    // console.log("windElectricity is ", windElectricity);
    // console.log("solarElectricity is ", solarElectricity);

    // Calculate the number of turbines and solar MW needed
    const numTurbines = Math.ceil(windElectricity / windTurbineAEP);

    let extraWindCapacityGW = (numTurbines * turbineCapacityMW) / 1000; // Convert MW to GW

    // Calculate the number of solar panels
    const solarElectricityKWh = solarElectricity * 1e9; // Convert TWh to kWh

    const panelOutputKWh =
      panelCapacityKW * solarCapacityFactorDecimal * hoursPerYear; // kWh per panel annually

    const numSolarPanels = Math.ceil(solarElectricityKWh / panelOutputKWh);

    // console.log("numSolarPanels is ", numSolarPanels);

    let extraSolarCapacityGW = (numSolarPanels * panelCapacityKW) / 1000000; // GW of solar capacity needed

    // console.log("extraSolarCapacityGW is ", extraSolarCapacityGW);

    // calculate pumped hydro
    let volumeOfWater = 0;

    if (includeStorage) {
      // windSolarRatio is defaulted to 90 i.e. 90% wind and 10% solae
      //  code below assumes 100% wind
      const averageHoursPerdayCanStoreWind = 8;
      const averageHoursPerdayCanStoreSolar = 6;
      const averagePerformanceDuringExcessProductionHoursWind = 0.7;
      const averagePerformanceDuringExcessProductionHoursSolar = 0.5;
      let storageNeededPerDayGWh = (totalEnergyOfNewGrid / 365) * 1000;

      // factor in losses when going from pumped hydro to electricity
      storageNeededPerDayGWh = storageNeededPerDayGWh / 0.7;

      const pumpedCapacity100 =
        (formData.electricity.currentWindCapacityGW
          ? formData.electricity.currentWindCapacityGW
          : 0) + extraWindCapacityGW;

      // assume it works at 70% when storing
      const pumpedCapacity70 =
        pumpedCapacity100 * averagePerformanceDuringExcessProductionHoursWind;

      // scale the lowDemandGW by a factor that the grid increases by
      const projectedLowerPowerDemandAtNightGW =
        (formData.electricity.lowDemandGW || 0) *
        (totalEnergyOfNewGrid /
          (existingFossilFuelElectricity + existingRenewableElectricity));

      const rateOfStorage = Math.max(
        0,
        pumpedCapacity70 - projectedLowerPowerDemandAtNightGW || 0
      );
      const totalWindCanBeStoredPerDay =
        rateOfStorage * averageHoursPerdayCanStoreWind;

      // solar
      const pumpedCapacitySolar100 =
        (formData.electricity.currentSolarCapacityGW
          ? formData.electricity.currentSolarCapacityGW
          : 0) + extraSolarCapacityGW;
      const pumpedCapacity70Solar =
        pumpedCapacitySolar100 *
        averagePerformanceDuringExcessProductionHoursSolar;

      // scale the lowDemandGW by a factor that the grid increases by
      const projectedLowerPowerDemandDuringDayGW =
        (formData.electricity.lowDemandDuringDayGW || 0) *
        (totalEnergyOfNewGrid /
          (existingFossilFuelElectricity + existingRenewableElectricity));

      const rateOfStorageSolar = Math.max(
        0,
        pumpedCapacity70Solar - (projectedLowerPowerDemandDuringDayGW || 0)
      );

      const totalSolarCanBeStoredPerDay =
        rateOfStorageSolar * averageHoursPerdayCanStoreSolar;

      const windContribution =
        totalWindCanBeStoredPerDay /
        (totalWindCanBeStoredPerDay + totalSolarCanBeStoredPerDay);
      const solarContribution =
        totalSolarCanBeStoredPerDay /
        (totalWindCanBeStoredPerDay + totalSolarCanBeStoredPerDay);

      const windTarget = storageNeededPerDayGWh * windContribution;
      const solarTarget = storageNeededPerDayGWh * solarContribution;

      // percentage capcity needed to increase wind
      const windCapacityIncreaseNeeded =
        (windTarget - totalWindCanBeStoredPerDay) / totalWindCanBeStoredPerDay;
      const solarCapacityIncreaseNeeded =
        (solarTarget - totalSolarCanBeStoredPerDay) /
        totalSolarCanBeStoredPerDay;

      extraWindCapacityGW =
        extraWindCapacityGW + extraWindCapacityGW * windCapacityIncreaseNeeded;

      extraSolarCapacityGW =
        extraSolarCapacityGW +
        extraSolarCapacityGW * (solarCapacityIncreaseNeeded || 0);

      //m = E/g*h
      const E = storageNeededPerDayGWh * storageDuration * 3.6 * 1000000000000;

      const g = 9.8;
      const h = lakeHeightDifference;

      const m = E / (g + h);

      volumeOfWater = Math.ceil(m / 1000);
    }

    return {
      extraWindCapacityGW,
      numTurbines,
      extraSolarCapacityGW,
      numSolarPanels,
      volumeOfWater,
      totalEnergyOfNewGrid,
    };
  };

  const processedData = {
    labels: ["Existing Grid", "Required Grid (Fossil-Free)"],
    datasets: [
      {
        label: "Existing Renewable Electricity",
        data: [
          newGrid.existingCarbonFreeElectricity
            ? newGrid.existingCarbonFreeElectricity
            : 0,
          newGrid.existingCarbonFreeElectricity
            ? newGrid.existingCarbonFreeElectricity
            : 0,
        ],
        backgroundColor: "#4CAF50",
      },
      {
        label: "Existing Carbon-Powered Electricity",
        data: [
          newGrid.existingFossilFuelElectricity
            ? newGrid.existingFossilFuelElectricity
            : 0,
          0,
        ],
        backgroundColor: "#d1d1e0",
      },
      {
        label: "Existing Carbon-Powered Electricity Now Converted To Renewable",
        data: [
          0,
          newGrid.existingFossilFuelElectricity
            ? newGrid.existingFossilFuelElectricity
            : 0,
        ],
        backgroundColor: "#8BC34A",
      },
      {
        label: "Electricity for Road Transport",
        data: [
          0,
          newGrid.roadTransport
            ? parseFloat(newGrid.roadTransport.toFixed(2))
            : 0,
        ],
        backgroundColor: "#CDDC39",
      },
      {
        label: "Electricity for Rail",
        data: [
          0,
          newGrid.electricityRequiredRailTWh
            ? parseFloat(newGrid.electricityRequiredRailTWh.toFixed(2))
            : 0,
        ],
        backgroundColor: "#CDDC39",
      },
      {
        label: "Electricity for Shipping",
        data: [
          0,
          newGrid.electricityNeededShipping
            ? parseFloat(newGrid.electricityNeededShipping.toFixed(2))
            : 0,
        ],
        backgroundColor: "#CDDC39",
      },
      {
        label: "Electricity for Heat",
        data: [0, newGrid.heat ? parseFloat(newGrid.heat.toFixed(2)) : 0],
        backgroundColor: "#FFEB3B",
      },
    ].filter((dataset) => dataset.data.some((value) => value > 0)), // Include only datasets with values > 0
  };

  const emissionsData = {
    labels: ["Current Emissions", "Required Grid Emissions"],
    datasets: [
      {
        label: "Road Transport Emissions",
        data: [
          newGrid.roadTransportEmissionsTotal
            ? newGrid.roadTransportEmissionsTotal
            : 0,
          0,
        ],
        backgroundColor: "#FF5722", // Red for transport
      },
      {
        label: "Rail Emissions",
        data: [newGrid.railEmissions ? newGrid.railEmissions : 0, 0],
        backgroundColor: "#FF9800", // Orange for rail
      },
      {
        label: "Shipping Emissions",
        data: [newGrid.shippingEmissions ? newGrid.shippingEmissions : 0, 0],
        backgroundColor: "#FFC107", // Yellow for shipping
      },
      {
        label: "Existing Fossil-Fuel Electricity Emissions",
        data: [
          newGrid.existingElectricityEmissions
            ? newGrid.existingElectricityEmissions
            : 0,
          0,
        ],
        backgroundColor: "#9E9E9E", // Gray for existing electricity
      },
      {
        label: "Existing Heat Emissions",
        data: [
          newGrid.existingHeatEmissions ? newGrid.existingHeatEmissions : 0,
          0,
        ],
        backgroundColor: "#607D8B", // Blue-gray for heat
      },
      {
        label: "New Grid Emissions",
        data: [0, newGrid.newGridEmissions ? newGrid.newGridEmissions : 0],
        backgroundColor: "#8BC34A", // Green for new grid emissions
      },
    ].filter((dataset) => dataset.data.some((value) => value > 0)), // Only include datasets with data > 0
  };

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#F3F4F6", // Light background for the header section
          borderBottom: "2px solid #E0E0E0", // Subtle border
          flexWrap: "wrap", // Allow wrapping for smaller screens
        }}
      >
        <div style={{ flex: "1", minWidth: "300px" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              color: "#007BFF", // Highlighted color
              margin: "0",
            }}
          >
            Wind and Solar Calculator
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#4A4A4A", // Subtle gray for description
              marginTop: "10px",
              lineHeight: "1.5",
            }}
          >
            This app estimates the number of wind turbines and solar panels
            needed to fully phase out fossil fuels in a country.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px", // Space between buttons
            flexWrap: "wrap", // Allow wrapping for smaller screens
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setShowContact(!showContact)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#FFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Add Your Country
          </button>
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#FFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Methodology
          </button>
        </div>
      </div>

      {showMethodology && <Methodology />}
      {showContact && <Contact />}

      <div className="country-dropdown-container">
        <label htmlFor="country-select" className="dropdown-label">
          Select Country or enter your own data for a country:
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={handleCountryChange}
            className="country-dropdown"
          >
            <option value="Ireland">Ireland</option>
            <option value="">No Country</option>
          </select>
          {/* Add the Clear button */}
          <button onClick={handleClearCountry} className="clear-button">
            Clear
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
          width: "100%",
          maxWidth: "100vw", // Ensures full viewport width
          boxSizing: "border-box", // Includes padding and borders in width calculations
        }}
      >
        <div
          style={{
            flex: "1 1 calc(24% - 20px)", // Allows three panels per row
            minWidth: "250px", // Reduced for better responsiveness
            padding: "15px",
            border: "1px solid #4CAF50", // Green border for renewable energy
            borderRadius: "5px",
            background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)", // Green gradient
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <img
              src="https://img.icons8.com/fluency/48/wind-turbine.png" // Wind turbine icon
              alt="Renewable Electricity"
              style={{ marginRight: "10px" }}
            />
            <h3 style={{ color: "#4CAF50", margin: 0 }}>
              Carbon-Free Electricity
              <Tooltip text="Enter the current amount of renewables and nuclear generated electricity the country generates in a year" />
            </h3>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label style={{ textAlign: "right", marginRight: "10px" }}>
              Current Carbon-Free Electricity per annum (TWh):
            </label>
            <input
              type="number"
              value={formData.electricity.existingCarbonFreeElectricity}
              onChange={(e) =>
                handleChange(e, "existingCarbonFreeElectricity", "electricity")
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "120px",
                boxSizing: "border-box",
              }}
            />

            <label style={{ textAlign: "right", marginRight: "10px" }}>
              Current Wind Capacity (GW):
            </label>
            <input
              type="number"
              value={formData.electricity.currentWindCapacityGW}
              onChange={(e) =>
                handleChange(e, "currentWindCapacityGW", "electricity")
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "120px",
                boxSizing: "border-box",
              }}
            />
            <label style={{ textAlign: "right", marginRight: "10px" }}>
              Current Solar Capacity (GW):
            </label>
            <input
              type="number"
              value={formData.electricity.currentSolarCapacityGW}
              onChange={(e) =>
                handleChange(e, "currentSolarCapacityGW", "electricity")
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "120px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Electricity Input */}
        <div
          style={{
            flex: "1 1 calc(24% - 20px)", // Allows three panels per row
            minWidth: "250px", // Reduced for better responsiveness
            padding: "15px",
            border: "1px solid #757575", // Medium gray border for carbon-powered panels
            borderRadius: "5px",
            backgroundColor: "#F5F5F5", // Light gray background for consistency
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <img
              src="https://img.icons8.com/fluency/48/electricity.png"
              alt="Electricity"
              style={{ marginRight: "10px" }}
            />
            <h3 style={{ color: "#616161", margin: 0 }}>
              Carbon-Powered Electricity{" "}
              <Tooltip text="Enter the current amount of fossil fuel powered electricity the country generates in a year" />
            </h3>{" "}
            {/* Dark gray text */}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "10fr 1fr",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              style={{
                textAlign: "right",
                marginRight: "10px",
                color: "#424242",
                display: "flex",
                alignItems: "center",
              }}
            >
              {" "}
              {/* Slightly darker gray */}
              Carbon-Powered Electricity Per Annum (TWh):
            </label>
            <input
              type="number"
              value={formData.electricity.existingFossilFuelElectricity}
              onChange={(e) =>
                handleChange(e, "existingFossilFuelElectricity", "electricity")
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "120px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Heat Input */}
        <div
          style={{
            flex: "1 1 calc(24% - 20px)", // Allows three panels per row
            minWidth: "250px", // Reduced for better responsiveness
            padding: "15px",
            border: "1px solid #757575", // Medium gray border for carbon-powered panels
            borderRadius: "5px",
            backgroundColor: "#F5F5F5", // Light gray background for consistency
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <img
              src="https://img.icons8.com/fluency/48/fire-element.png" // Updated fire icon
              alt="Heat"
              style={{ marginRight: "10px" }}
              height="48px"
              width="48px"
            />
            <h3 style={{ color: "#616161", margin: 0 }}>
              Carbon-Powered Heat
              <Tooltip text="Enter the current amount of heat generated by fossil fuels the country consumes in a year" />
            </h3>{" "}
            {/* Dark gray text */}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              style={{
                textAlign: "right",
                marginRight: "10px",
                color: "#424242",
              }}
            >
              {" "}
              {/* Slightly darker gray */}
              Home/Office Heating Per Annum (TWh):
            </label>
            <input
              type="number"
              value={formData.heat.residentialHeat}
              onChange={(e) => handleChange(e, "residentialHeat", "heat")}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "120px",
                boxSizing: "border-box",
              }}
            />
            <label
              style={{
                textAlign: "right",
                marginRight: "10px",
                color: "#424242",
              }}
            >
              {" "}
              {/* Slightly darker gray */}
              Industry Heat Per Annum (TWh):
            </label>
            <input
              type="number"
              value={formData.heat.industryHeat}
              onChange={(e) => handleChange(e, "industryHeat", "heat")}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "120px",
                boxSizing: "border-box",
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
            width: "100%", // Full width of the parent container
            padding: "15px",
            border: "1px solid #757575", // Dark gray border for industrial feel
            borderRadius: "5px",
            backgroundColor: "#F5F5F5", // Light gray for fossil fuel association
            boxSizing: "border-box", // Ensures padding is included in width
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <img
              width="48"
              height="48"
              src="https://img.icons8.com/emoji/48/high-speed-train-emoji.png"
              alt="high-speed-train"
              style={{ marginRight: "10px" }}
            />
            <h3 style={{ color: "#616161", margin: 0 }}>
              Carbon-Powered Rail
              <Tooltip text="Enter the current amount of litres of diesel a country uses to power its rail network in a year" />
            </h3>{" "}
            {/* Dark gray text */}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              style={{
                textAlign: "right",
                marginRight: "10px",
                color: "#424242",
              }}
            >
              {" "}
              {/* Slightly darker gray */}
              Diesel Fuel Used (litres):
            </label>
            <input
              type="number"
              value={formData.railDiesel}
              onChange={(e) => handleChange(e, "railDiesel")}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <img
              width="48"
              height="48"
              src="https://img.icons8.com/emoji/48/passenger-ship.png"
              alt="passenger-ship"
            />
            <h3 style={{ color: "#616161", margin: 0 }}>
              Carbon-Powered Shipping
              <Tooltip text="Enter the current amount of litres of diesel a country uses to power its shipping fleet in a year" />
            </h3>{" "}
            {/* Dark gray text */}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              style={{
                textAlign: "right",
                marginRight: "10px",
                color: "#424242",
              }}
            >
              {" "}
              {/* Slightly darker gray */}
              Diesel Fuel Used (litres):
            </label>
            <input
              type="number"
              value={formData.shippingDiesel}
              onChange={(e) => handleChange(e, "shippingDiesel")}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #CCC",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          <table
            style={{
              width: "100%", // Full width of the roadTransport panel
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{ borderBottom: "2px solid #BDBDBD", padding: "10px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0px",
                    }}
                  >
                    <img
                      src="https://img.icons8.com/fluency/48/car.png"
                      alt="Transport"
                      style={{ marginRight: "10px" }}
                    />
                    <h3 style={{ color: "#616161", margin: 0 }}>
                      Carbon-Powered Road Transport
                      <Tooltip text="Enter the current number of vehicles in the country and the average distance each type travels in a year" />
                    </h3>{" "}
                    {/* Dark gray text */}
                  </div>
                </th>
                <th
                  style={{
                    borderBottom: "2px solid #BDBDBD",
                    padding: "10px",
                    color: "#616161",
                  }}
                >
                  {" "}
                  {/* Dark gray text */}
                  Number of Vehicles
                </th>
                <th
                  style={{
                    borderBottom: "2px solid #BDBDBD",
                    padding: "10px",
                    color: "#616161",
                  }}
                >
                  {" "}
                  {/* Dark gray text */}
                  Average Distance (km)
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(formData.roadTransport).map((category) => (
                <tr key={category}>
                  <td
                    style={{
                      padding: "10px",
                      fontWeight: "bold",
                      color: "#424242",
                    }}
                  >
                    {" "}
                    {/* Slightly darker gray */}
                    {category === "cars"
                      ? "Cars"
                      : category === "busesSmall"
                      ? "Buses Small"
                      : category === "busesLarge"
                      ? "Buses Large"
                      : category === "lightGoods"
                      ? "Light Goods Vehicles"
                      : category === "heavyGoods"
                      ? "Heavy Goods Vehicles"
                      : category === "tractors"
                      ? "Tractors"
                      : category === "motorcycles"
                      ? "Motorcycles"
                      : category === "other"
                      ? "Other Vehicles"
                      : ""}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      value={formData.roadTransport[category].numVehicles}
                      onChange={(e) =>
                        handleChange(
                          e,
                          "roadTransport",
                          category,
                          "numVehicles"
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "5px",
                        borderRadius: "5px",
                        border: "1px solid #BDBDBD",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      value={formData.roadTransport[category].distance}
                      onChange={(e) =>
                        handleChange(e, "roadTransport", category, "distance")
                      }
                      style={{
                        width: "100%",
                        padding: "5px",
                        borderRadius: "5px",
                        border: "1px solid #BDBDBD",
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add the note at the bottom */}
          <div
            style={{
              marginTop: "20px", // Add some spacing from the content above
              padding: "10px",
              backgroundColor: "#FFF8E1", // Light yellow background for emphasis
              border: "1px solid #FFC107", // Yellow border
              borderRadius: "5px",
              color: "#424242", // Darker gray text
              fontStyle: "italic", // Italic text for emphasis
            }}
          >
            <strong>Note:</strong> Aviation is not considered as there is
            currently no technology that can replace jet fuel.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
        <div
          style={{
            display: "flex",
            gap: "20px", // Space between the two panels
            width: "100%", // Make the container take up the full width
          }}
        >
          {/* Left Panel: Controls */}
          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              flex: 1,
              backgroundColor: "#f9f9f9",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Controls</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 3fr",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <label style={{ textAlign: "left" }}>
                Average Turbine Capacity (MW):
              </label>
              <input
                type="number"
                value={turbineCapacityMW}
                onChange={(e) =>
                  handleParameterChange(
                    setTurbineCapacityMW,
                    parseFloat(e.target.value)
                  )
                }
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #CCC",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <label style={{ textAlign: "left" }}>
                Wind Capacity Factor (%):
              </label>
              <input
                type="number"
                value={windCapacityFactor}
                onChange={(e) =>
                  handleParameterChange(
                    setWindCapacityFactor,
                    parseFloat(e.target.value)
                  )
                }
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #CCC",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <label style={{ textAlign: "left" }}>
                Solar Capacity Factor (%):
              </label>
              <input
                type="number"
                value={solarCapacityFactor}
                onChange={(e) =>
                  handleParameterChange(
                    setSolarCapacityFactor,
                    parseFloat(e.target.value)
                  )
                }
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #CCC",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Right Panel: Storage Settings */}
          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              flex: 1,
              backgroundColor: "#f9f9f9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>Storage Settings</h2>
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "20px",
                    borderRadius: "20px",
                    backgroundColor: includeStorage ? "#4caf50" : "#ccc",
                    position: "relative",
                    transition: "background-color 0.3s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: includeStorage ? "22px" : "2px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      transition: "left 0.3s",
                    }}
                  ></span>
                </span>

                <input
                  type="checkbox"
                  checked={includeStorage}
                  onChange={(e) => setIncludeStorage(e.target.checked)}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {includeStorage && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 3fr",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <label style={{ textAlign: "left" }}>
                  Typical Current Low Power Demand At Night (GW):
                </label>
                <input
                  type="number"
                  value={formData.electricity.lowDemandGW}
                  onChange={(e) =>
                    handleChange(e, "lowDemandGW", "electricity")
                  }
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #CCC",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <label style={{ textAlign: "left" }}>
                  Typical Current Low Power Demand During Day (GW):
                </label>
                <input
                  type="number"
                  value={formData.electricity.lowDemandDuringDayGW}
                  onChange={(e) =>
                    handleChange(e, "lowDemandDuringDayGW", "electricity")
                  }
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #CCC",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <label style={{ textAlign: "left" }}>
                  Height Between Upper and Lower Lake (m):
                </label>
                <input
                  type="number"
                  value={lakeHeightDifference}
                  onChange={(e) =>
                    setLakeHeightDifference(parseFloat(e.target.value))
                  }
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #CCC",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "5px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Grid Comparison - Chart */}
        <div
          style={{
            flex: "5",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          <h2 style={{ marginBottom: 0 }}>Grid Upgrades Needed</h2>

          <Bar
            data={processedData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    font: {
                      size: 12,
                      weight: "bold",
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
                    text: "TWh",
                    font: { size: 14 },
                    color: "#000",
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
          <div style={{ marginTop: "5px" }}>
            <p style={{ margin: "3px" }}>
              <strong>Existing Carbon-Free Grid:</strong>{" "}
              {processedData?.datasets[0]?.data[0]}
              TWh
            </p>
            <p style={{ margin: "3px" }}>
              <strong>Existing Grid All Sources:</strong>{" "}
              {(() => {
                if (!processedData?.datasets) {
                  return "0.00"; // Return a default value if datasets are not available
                }

                const result = processedData.datasets.reduce(
                  (acc, dataset, index) => {
                    const dataValue = dataset?.data?.[0];
                    const numericValue = Number(dataValue) || 0;

                    const updatedAcc = acc + numericValue;

                    return updatedAcc;
                  },
                  0
                );

                return result.toFixed(2);
              })()}
              TWh
            </p>
            <p style={{ margin: "3px" }}>
              <strong>Required Carbon-Free Grid:</strong>{" "}
              {(() => {
                if (!processedData?.datasets) {
                  return "0.00"; // Return a default value if datasets are not available
                }

                const result = processedData.datasets.reduce(
                  (acc, dataset, index) => {
                    const dataValue = dataset?.data?.[1];
                    const numericValue = Number(dataValue) || 0;

                    const updatedAcc = acc + numericValue;

                    return updatedAcc;
                  },
                  0
                );

                return result.toFixed(2);
              })()}
              TWh
            </p>
            <h2 style={{ marginBottom: 0 }}>Emissions</h2>
            <Bar
              data={emissionsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    labels: {
                      font: {
                        size: 12,
                        weight: "bold",
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
                      text: "MtCO₂e", // Adjust for emissions unit
                      font: { size: 14 },
                      color: "#000",
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
          </div>
        </div>

        {/* Required Infrastructure */}
        <div
          style={{
            flex: "5",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          {includeStorage && (
            <div>
              <h2>Pumped Hydro</h2>

              <div
                style={{
                  textAlign: "left",
                  fontFamily: "Arial, sans-serif",
                  padding: "10px",
                  backgroundColor: "#e0f7fa",
                  border: "1px solid #b3d9ff",
                }}
              >
                {/* Icon */}
                <div style={{ marginBottom: "5px", textAlign: "center" }}>
                  <span
                    role="img"
                    aria-label="dam"
                    style={{ fontSize: "48px", color: "#0288d1" }}
                  >
                    💦{" "}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "1.0em",
                    color: "#333",
                    margin: "10px 0",
                  }}
                >
                  Consumption per day with Required Grid (GWh):{" "}
                  {(((newGrid.totalEnergyOfNewGrid || 0) / 365) * 1000).toFixed(
                    2
                  )}
                </p>

                {/* Storage Information */}
                <p
                  style={{
                    fontSize: "1.0em",
                    color: "#333",
                    margin: "10px 0",
                  }}
                >
                  <span style={{ color: "#007BFF", fontWeight: "bold" }}>
                    {newGrid?.volumeOfWater?.toLocaleString()} cubic metres
                  </span>{" "}
                  of water stored at a height difference of
                  <span style={{ color: "#007BFF", fontWeight: "bold" }}>
                    {" "}
                    {lakeHeightDifference}m{" "}
                  </span>
                  are needed for
                  <span style={{ color: "#007BFF", fontWeight: "bold" }}>
                    {" "}
                    {storageDuration} day{storageDuration > 1 ? "s" : ""}
                  </span>{" "}
                  worth of storage.
                  <br />
                  This volume is approximately{" "}
                  <span style={{ color: "#007BFF", fontWeight: "bold" }}>
                    {(newGrid?.volumeOfWater / 7452000000).toFixed(2)}%
                  </span>{" "}
                  of the volume of Loch Ness, the largest lake in Great Britain
                  by volume.
                </p>
              </div>
            </div>
          )}

          <h3>Required Infrastructure</h3>
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "space-between",
            }}
          >
            {/* Wind Section */}
            <div
              style={{
                flex: "1",
                padding: "15px",
                border: "1px solid #4CAF50",
                borderRadius: "5px",
                backgroundColor: "#E8F5E9",
                textAlign: "center",
              }}
            >
              <img
                src="https://img.icons8.com/fluency/48/wind-turbine.png"
                alt="Wind Turbine"
                style={{ marginBottom: "10px" }}
              />
              <h4 style={{ color: "#4CAF50" }}>Wind Energy</h4>
              <p>
                <strong>Extra Capacity:</strong>{" "}
                {newGrid.extraWindCapacityGW
                  ? newGrid.extraWindCapacityGW.toFixed(2)
                  : "N/A"}{" "}
                GW
              </p>
              <p>
                <strong>Extra Turbines:</strong>{" "}
                {newGrid.numTurbines !== undefined
                  ? newGrid.numTurbines.toLocaleString()
                  : "N/A"}
              </p>
            </div>

            {/* Solar Section */}
            <div
              style={{
                flex: "1",
                padding: "15px",
                border: "1px solid #FFC107",
                borderRadius: "5px",
                backgroundColor: "#FFF8E1",
                textAlign: "center",
              }}
            >
              <img
                src="https://img.icons8.com/fluency/48/solar-panel.png"
                alt="Solar Panel"
                style={{ marginBottom: "10px" }}
              />
              <h4 style={{ color: "#FFC107" }}>Solar Energy</h4>
              <p>
                <strong>Extra Capacity:</strong>{" "}
                {newGrid.extraSolarCapacityGW
                  ? newGrid.extraSolarCapacityGW.toFixed(2)
                  : "N/A"}{" "}
                GW
              </p>
              <p>
                <strong>Extra Panels:</strong>{" "}
                {newGrid.numSolarPanels !== undefined
                  ? newGrid.numSolarPanels.toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* New Chart */}
          <div>
            <h3>Current vs Needed Capacity</h3>
            <Bar
              data={{
                labels: ["Wind Capacity (GW)", "Solar Capacity (GW)"],
                datasets: [
                  {
                    label: "Current Capacity",
                    data: [
                      newGrid.currentWindCapacityGW,
                      newGrid.currentSolarCapacityGW,
                    ],
                    backgroundColor: ["#2196F3", "#FFD700"], // Light Blue for wind, Light Yellow for solar
                    datalabels: {
                      color: ["#FFFFFF", "#000000"], // White text for Wind, Black text for Solar
                      anchor: "center",
                      align: "center",
                      formatter: (value, context) => {
                        const numericValue = Number(value); // Convert to a number
                        return !isNaN(numericValue)
                          ? `Current Capacity: ${numericValue.toFixed(2)}`
                          : "";
                      },
                    },
                  },
                  {
                    label: "Extra Capacity Needed",
                    data: [
                      newGrid.extraWindCapacityGW,
                      newGrid.extraSolarCapacityGW,
                    ],
                    backgroundColor: ["#0D47A1", "#FFC107"], // Dark Blue for wind, Dark Yellow for solar
                    datalabels: {
                      color: ["#FFFFFF", "#000000"], // White text for Wind, Black text for Solar
                      anchor: "center",
                      align: "center",
                      formatter: (value, context) => {
                        const numericValue = Number(value); // Convert to a number

                        return !isNaN(numericValue)
                          ? `Extra Needed: ${numericValue.toFixed(2)}`
                          : "";
                      },
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
                      weight: "bold",
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
                      text: "Capacity (GW)", // Label for the y-axis
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
  );
}

export default App;

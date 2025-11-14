import { useState, useEffect } from "react";
import "./App.css";
import Methodology from "./Methodology";
import Contribute from "./Contribute";
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



const gasEmissionsElectricityPerKWH = 450;
const coalEmissionsElectricityPerKWH = 900;

const gasEmissionsHeatPerKWH = 185;
const emissionsPerLitreDiesel = 2620;
const emissionsWindPerKWH = 0;

const initialFormData = {
  electricity: {
    existingCarbonFreeElectricity: "",
    existingGasElectricity: "",   // NEW
    existingCoalElectricity: "",  // NEW
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
      emissionsPerKm: 168,
    },
    busesSmall: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.23,
      totalElectricity: 0,
      emissionsPerKm: 180.8,
    },
    busesLarge: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 1.2,
      totalElectricity: 0,
      emissionsPerKm: 822,
    },
    lightGoods: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.23,
      totalElectricity: 0,
      emissionsPerKm: 180.8,
    },
    heavyGoods: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 1.2,
      totalElectricity: 0,
      emissionsPerKm: 900,
    },
    tractors: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 1.2,
      totalElectricity: 0,
      emissionsPerKm: 900,
    },
    motorcycles: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.11,
      totalElectricity: 0,
      emissionsPerKm: 46.5,
    },
    other: {
      numVehicles: "",
      distance: "",
      kWhPerKm: 0.23,
      totalElectricity: 0,
      emissionsPerKm: 180.8,
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
  const [showContribute, setShowContribute] = useState(false); // State for showing Contribute
  ///Contribute
  const [showContact, setShowContact] = useState(false); // State for showing Contact
  const [newGrid, setNewGrid] = useState({}); // State for storing new grid calculation
  const [turbineCapacityMW, setTurbineCapacityMW] = useState(6.6); // Average Turbine Capacity
  const [windCapacityFactor, setWindCapacityFactor] = useState(26); // Wind Capacity Factor in %
  const [solarCapacityFactor, setSolarCapacityFactor] = useState(13); // Solar Capacity Factor in %
  const [windSolarRatio, setWindSolarRatio] = useState(70); // Default to 90% wind
  const [storageDuration, setStorageDuration] = useState(2);
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

    const existingFossilFuelElectricityTWh =
    (parseFloat(formData.electricity.existingGasElectricity || 0) +
      parseFloat(formData.electricity.existingCoalElectricity || 0));

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
    const dieselEnergyContent = 9.96; // kWh per liter
    const dieselEngineEfficiency = 0.40; // 40% efficient
    const electricLocomotiveEfficiency = 0.85; // 85% efficient
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
    const electricityNeededShipping = (kgOfHydrogenNeeded * 56) / 1000000000;

    const residentialHeat = formData.heat.residentialHeat
      ? parseFloat(formData.heat.residentialHeat) / 4
      : 0;
    const industryHeat = formData.heat.industryHeat
      ? parseFloat(formData.heat.industryHeat)
      : 0;

    const newGridSize =
      existingFossilFuelElectricityTWh +
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
    // electricity emissions (split gas vs coal)
    const existingGasElectricityEmissions =
      ((formData.electricity.existingGasElectricity || 0) * 1e9 * gasEmissionsElectricityPerKWH) /
      1e6 / 1e6; // to Mt

    const existingCoalElectricityEmissions =
      ((formData.electricity.existingCoalElectricity || 0) * 1e9 * coalEmissionsElectricityPerKWH) /
      1e6 / 1e6; // to Mt

    const existingCarbonFreeElectricityEmissions =
      ((formData.electricity.existingCarbonFreeElectricity || 0) * 1e9 * emissionsWindPerKWH) /
      1e6 / 1e6; // to Mt (likely zero)

    const existingElectricityEmissions =
      existingGasElectricityEmissions +
      existingCoalElectricityEmissions +
      existingCarbonFreeElectricityEmissions;



    // heat emissions
    const existingHeatEmissions =
      ((formData.heat.residentialHeat || 0) *
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
      existingFossilFuelElectricityTWh  // gas + coal total
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
      existingCarbonFreeElectricity: formData.electricity.existingCarbonFreeElectricity,
      // NEW:
      existingGasElectricity: formData.electricity.existingGasElectricity,
      existingCoalElectricity: formData.electricity.existingCoalElectricity,
      // Optional helper if you still need a combined figure in charts:
      existingFossilFuelElectricity: existingFossilFuelElectricityTWh,

      currentWindCapacityGW: formData.electricity.currentWindCapacityGW,
      currentSolarCapacityGW: formData.electricity.currentSolarCapacityGW,
      volumeOfWater: volumeOfWater,
      totalEnergyOfNewGrid: totalEnergyOfNewGrid,
      roadTransportEmissionsTotal: roadTransportEmissionsTotal,
      railEmissions: railEmissions,
      shippingEmissions: shippingEmissions,

      // Emissions (split and total)
      existingElectricityEmissions: existingElectricityEmissions,
      existingGasElectricityEmissions,     // NEW
      existingCoalElectricityEmissions,    // NEW
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
        existingGasElectricity: 20.0,   // NEW (example split)
        existingCoalElectricity: 1.25,  // NEW (example split)
        currentWindCapacityGW: 5.585,
        currentSolarCapacityGW: 1.185,
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
          kWhPerKm: 1.2,
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
          kWhPerKm: 1.2,
          totalElectricity: 0,
          emissionsPerKm: 1045,
        },
        tractors: {
          numVehicles: 84170,
          distance: 2000,
          kWhPerKm: 1.2,
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
    Spain: {
      electricity: {
        existingCarbonFreeElectricity: 172.67, 
        // ~172.7 TWh generated from carbon-free sources 
        // (42.2% renewables + 20.3% nuclear in 2022) [1][2]

        existingGasElectricity: 68.14,
        // ~68.14 TWh generated from gas-fired power plants in 2022 [3]

        existingCoalElectricity: 7.77,
        // ~7.77 TWh generated from coal in 2022 [4]

        currentWindCapacityGW: 29.994,
        // 29.994 GW wind capacity installed by end of 2022 [5]

        currentSolarCapacityGW: 22.089,
        // 22.089 GW solar (19.785 GW PV + 2.304 GW CSP) by end of 2022 [5]

        lowDemandGW: 18.0,              // Approx. low overnight demand
        lowDemandDuringDayGW: 25.0      // Approx. low midday demand
      },

      heat: {
        residentialHeat: 93.88,  // ~93.9 TWh residential heat (space + water)
        industryHeat: 153.0      // ~153.0 TWh industrial heat
      },

      windSolarRatio: 90,        // Default 90% wind, 10% solar (assumption)

      roadTransport: {
        cars: {
          numVehicles: 25570000, // ~25.57M passenger cars (2022) [6]
          distance: 16352,
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 130
        },

        busesSmall: {
          numVehicles: 40426,    // ~40.4k small buses [7][8]
          distance: 39504,
          kWhPerKm: 0.23,
          totalElectricity: 0,
          emissionsPerKm: 153
        },

        busesLarge: {
          numVehicles: 21083,    // ~21.1k large buses [7][8]
          distance: 34965,
          kWhPerKm: 1.2,
          totalElectricity: 0,
          emissionsPerKm: 822
        },

        lightGoods: {
          numVehicles: 3900000,  // ~3.90M light goods vans [9][10]
          distance: 20615,
          kWhPerKm: 0.23,
          totalElectricity: 0,
          emissionsPerKm: 193
        },

        heavyGoods: {
          numVehicles: 579000,   // ~579k heavy trucks [11]
          distance: 20615,
          kWhPerKm: 1.2,
          totalElectricity: 0,
          emissionsPerKm: 1045
        },

        tractors: {
          numVehicles: 1200000,  // ~1.2M agricultural tractors [12]
          distance: 2000,
          kWhPerKm: 1.2,
          totalElectricity: 0,
          emissionsPerKm: 1045
        },

        motorcycles: {
          numVehicles: 4600000,  // ~4.6M motorcycles & mopeds [13]
          distance: 2741,
          kWhPerKm: 0.11,
          totalElectricity: 0,
          emissionsPerKm: 113
        },

        other: {
          numVehicles: 660000,   // ~0.66M other vehicles (est.)
          distance: 20391,
          kWhPerKm: 0.23,
          totalElectricity: 0,
          emissionsPerKm: 193
        }
      },

      railDiesel: 50000000,      
      // ~50M litres diesel for rail (~0.48 TWh) [14]

      shippingDiesel: 500000000  
      // ~500M litres diesel for domestic shipping (est.)
    },
    // [1] La demanda de electricidad en España en 2022
    //     https://www.energias-renovables.com/panorama/cae-la-demanda-de-electricidad-en-espana-20230105
    //
    // [2] Centrales Nucleares – MITECO
    //     https://www.miteco.gob.es/es/energia/nuclear/centrales.html
    //
    // [3] & [4] ¿De dónde procede la energía que consumimos en España?
    //     CaixaBank Research
    //     https://www.caixabank.com/es/esfera/content/de-donde-procede-energia-consumimos-espana
    //
    // [5] Spain – Energy (Trade.gov)
    //     https://www.trade.gov/country-commercial-guides/spain-energy
    //
    // [6] [9] [10] [11] [13] ACEA – Vehicles in Use 2023
    //     https://www.acea.auto/files/ACEA-report-vehicles-in-use-europe-2023.pdf
    //
    // [7] [8] Radiografía del parque español de autobuses
    //     https://autopos.es/posventa-camion/radiografia-del-parque-espanol-de-autobuses-asi-estamos/
    //
    // [12] Maquinaria agrícola – EFEAgro
    //     https://efeagro.com/agricultura/maquinaria-agricola/
    //
    // [14] Consumos energéticos y emisiones de la alta velocidad ferroviaria
    //     https://www.geotren.es/blog/consumos-energeticos-y-emisiones-de-la-alta-velocidad-ferroviaria/

    UK: {
      electricity: {
        existingCarbonFreeElectricity: 194.5,
        // ~194.5 TWh generated from carbon-free sources (renewables + nuclear) in 2024 [1][5]

        existingGasElectricity: 86.7,
        // ~86.7 TWh generated from gas in 2024 [1][5]

        existingCoalElectricity: 2.0,
        // ~2.0 TWh generated from coal in 2024 (record low) [1][5]

        currentWindCapacityGW: 30.4,
        // ~30.4 GW wind (15.7 GW onshore + 14.7 GW offshore) at end of 2024 [2]

        currentSolarCapacityGW: 18.1,
        // ~18.1 GW solar PV capacity as of April 2025 [3]

        lowDemandGW: 13.4,
        // Forecast record low national demand ~13.4 GW in summer 2025 [4][13]

        lowDemandDuringDayGW: 15.6
        // Typical lowest daytime (midday) demand ~15.6 GW in recent summers [6]
      },

      heat: {
        residentialHeat: 394,
        // ~394 TWh/yr heat demand in homes (space heating + hot water) (around 2018) [7][8]

        industryHeat: 326
        // ~326 TWh/yr total industrial and non-domestic heat demand (incl. process heat) [7][9]
      },

      // Assumed wind:solar generation ratio (90% wind, 10% solar)
      windSolarRatio: 90,

      roadTransport: {
        cars: {
          numVehicles: 34360000,
          // ~34.36 million licensed cars (mid-2025) [10]

          distance: 11500,          // km per car per year (~7,100 miles) [10]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 150       // gCO2/km fleet-average tailpipe (approx.)
        },

        busesSmall: {
          numVehicles: 90000,
          // ~90k small buses/minibuses (subset of total bus/coach stock, est.)

          distance: 21000,          // km per year per small bus (~13,000 miles/yr, est.)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 500       // gCO2/km diesel minibus, estimated [11]
        },

        busesLarge: {
          numVehicles: 60000,
          // ~60k large buses/coaches (remaining share of bus/coach fleet, est.)

          distance: 21000,          // km per year per large bus (~13,000 miles/yr)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 822       // gCO2/km typical large diesel bus [11]
        },

        lightGoods: {
          numVehicles: 4870000,
          // ~4.87 million light goods vehicles (vans) [10]

          distance: 19300,          // km per van per year (~12,000 miles/yr) [10]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 250       // gCO2/km diesel van (avg), est.
        },

        heavyGoods: {
          numVehicles: 540000,
          // ~0.54 million heavy goods vehicles [10]

          distance: 49400,          // km per HGV per year (~30,700 miles/yr) [10]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1200      // gCO2/km heavy diesel truck, est.
        },

        tractors: {
          numVehicles: 300000,
          // ~300k agricultural tractors (subset of “other vehicles”) [10]

          distance: 3000,           // km per tractor per year (low road usage, est.)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 600       // gCO2/km diesel tractor, est.
        },

        motorcycles: {
          numVehicles: 1480000,
          // ~1.48 million motorcycles [10]

          distance: 3260,           // km per motorcycle per year (~2,000 miles/yr) [10]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 120       // gCO2/km average petrol motorcycle, est.
        },

        other: {
          numVehicles: 570000,
          // ~0.57 million “other” vehicles (non-tractor remainder of ~0.87M other) [10]

          distance: 1000,           // km per year per other vehicle (very low usage, est.)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 300       // gCO2/km mixed specialised vehicles, est.
        }
      },

      railDiesel: 557000000,
      // ~557 million litres diesel used by passenger + freight rail in 2023/24 [12]

      shippingDiesel: 1700000000
      // ~1.7 billion litres marine fuel for domestic shipping (~5 MtCO2/yr, est.) [1]
    },

    // [1] UK energy statistics – DUKES 2025, Chapter 5 (electricity & fuel use)
    //     https://assets.publishing.service.gov.uk/media/688a28656478525675739051/DUKES_2025_Chapter_5.pdf
    //
    // [2] RenewableUK – “UK wind and global offshore wind: 2024 in review”
    //     https://www.renewableuk.com/energypulse/blog/uk-wind-and-global-offshore-wind-2024-in-review/
    //
    // [3] Solar Power Portal – “UK solar capacity up 5.9% year-on-year”
    //     https://www.solarpowerportal.co.uk/solar-technology/uk-solar-capacity-up-5-9-year-on-year
    //
    // [4] Strategic Energy Europe – “UK grid operator prepares for record-breaking demand drop this 2025 summer”
    //     https://strategicenergy.eu/uk-demand-drop-solar-surge/
    //
    // [5] The Guardian – “UK use of gas and coal for electricity at lowest since 1957”
    //     https://www.theguardian.com/business/2024/jan/03/uk-gas-coal-electricity-fossil-fuels-renewables
    //
    // [6] National Grid ESO – Summer Outlook / Blackout report (demand troughs)
    //     https://www.theblackoutreport.co.uk/2023/04/20/national-grid-summer-outlook-2023/
    //
    // [7] “Spatial and temporal data to study residential heat decarbonisation pathways in England and Wales”
    //     Scientific Data (Nature)
    //     https://www.nature.com/articles/s41597-022-01356-9
    //
    // [8] Ofgem – “The decarbonisation of heat”
    //     https://www.ofgem.gov.uk/sites/default/files/docs/2016/11/ofgem_future_insights_programme_-_the_decarbonisation_of_heat.pdf
    //
    // [9] Heat Roadmap Europe – Country Presentation: UK
    //     https://heatroadmap.eu/wp-content/uploads/2018/11/HRE4-Country_presentation-UK.pdf
    //
    // [10] RAC Foundation – “General facts and figures about roads and road use”
    //     https://www.racfoundation.org/motoring-faqs/mobility
    //
    // [11] Carbon Independent – “Emissions from bus travel”
    //     https://www.carbonindependent.org/20.html
    //
    // [12] Office of Rail and Road – “Rail Environment, April 2023 to March 2024”
    //     https://dataportal.orr.gov.uk/media/q34mblpr/rail-environment-2023-24.pdf
    //
    // [13] Reuters – “UK power grid could face lowest-ever demand this summer, operator says”
    //     https://www.reuters.com/world/uk/uk-power-grid-could-face-lowest-ever-demand-this-summer-operator-says-2025-04-16/


    Nigeria: {
      electricity: {
        existingCarbonFreeElectricity: 9.3,
        // ~9.3 TWh hydro + other renewables generation in 2022 [1][2][4]

        existingGasElectricity: 28.6,
        // ~28.6 TWh gas-fired generation in 2022 (~75% of total) [1][2][4][6]

        existingCoalElectricity: 0,
        // ~0 TWh coal-fired generation (coal ~0% of mix) [3]

        currentWindCapacityGW: 0.01,
        // ~0.01 GW installed wind capacity (~10 MW pilot) [4]

        currentSolarCapacityGW: 0.386,
        // ~0.386 GW installed solar PV capacity (around 2024) [4][5]

        lowDemandGW: 3.0,
        // ~3.0 GW approximate lowest off-peak demand (~3000 MW) [6]

        lowDemandDuringDayGW: 3.57
        // ~3.57 GW daytime minimum demand on high-generation days [6]
      },

      heat: {
        residentialHeat: 289,
        // ~289 TWh household heat/cooking (mainly biomass; ~42% of final energy use) [1]

        industryHeat: 100
        // ~100 TWh industrial process heat (~14–15% of final energy use) [1][2]
      },

      // Default mix assumption for renewables in model (Nigeria is solar-dominated):
      windSolarRatio: 90,

      roadTransport: {
        cars: {
          numVehicles: 4740834,
          // ~4.74 million passenger cars (2018 estimate: private, state, diplomat-owned) [7]

          distance: 15000,        // km per car per year (avg) [9]
          kWhPerKm: 0.19,         // if electrified
          totalElectricity: 0,
          emissionsPerKm: 180     // gCO2/km, est. average gasoline car
        },

        busesSmall: {
          numVehicles: 300000,
          // ~300k minibuses (e.g. “danfo”; Lagos alone ~75k) [8]

          distance: 30000,        // km per year (intensive urban service) [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 500     // gCO2/km older diesel/petrol minibuses, est.
        },

        busesLarge: {
          numVehicles: 50000,
          // ~50k large buses (intercity coaches, BRT, etc.) [7][8]

          distance: 50000,        // km per year (long-distance + BRT) [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 800     // gCO2/km diesel coach/bus, est.
        },

        lightGoods: {
          numVehicles: 500000,
          // ~500k light goods vehicles (pickups, vans) [7]

          distance: 20000,        // km per year [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 400     // gCO2/km diesel pickup/van, est.
        },

        heavyGoods: {
          numVehicles: 200000,
          // ~200k heavy goods vehicles (trucks, trailers) [7]

          distance: 50000,        // km per year (frequent long-haul) [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1000    // gCO2/km HDVs dominate transport emissions [12]
        },

        tractors: {
          numVehicles: 50000,
          // ~50k agricultural tractors (low mechanisation) [7][12]

          distance: 2000,         // km per year (mostly off-road) [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1000    // gCO2/km diesel tractor, est.
        },

        motorcycles: {
          numVehicles: 5100000,
          // ~5.1 million registered two-wheelers (2022) [10]

          distance: 10000,        // km per year (heavily used as taxis/deliveries) [9][10]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 50      // gCO2/km small-engine motorcycles, high fuel economy
        },

        other: {
          numVehicles: 400000,
          // ~400k other vehicles (three-wheelers, specialised vehicles, etc.) [7][12]

          distance: 10000,        // km per year [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 200     // gCO2/km mixed fleet average, est.
        }
      },

      railDiesel: 15000000,
      // ~15 million litres diesel used by rail per year (~24k L/day on one main route; ~0.7% diesel use) [11][12]

      shippingDiesel: 35000000
      // ~35 million litres diesel for domestic navigation (~1.7% of diesel use; ~2× rail) [12]
    },

    // [1] IEA – Country Profile: Nigeria
    //     https://iea.blob.core.windows.net/assets/c0cba412-d48c-4712-9144-48f93bd9e277/CountryProfileNigeria.pdf
    //
    // [2] Climate Analytics – 1.5°C Pathways: Power sector Nigeria
    //     https://1p5ndc-pathways.climateanalytics.org/countries/nigeria/sectors/power
    //
    // [3] “Coal As Another Alternative Answer To Power Generation – Nigeria ...”
    //     https://journals.co.za/doi/abs/10.10520/ejc-sl_jeteas_v16_n3_a5
    //
    // [4] Trade.gov – “Electricity, Power Systems and Renewable Energy” (Nigeria)
    //     https://www.trade.gov/country-commercial-guides/electricity-power-systems-and-renewable-energy
    //
    // [5] Energy Tracker Asia – “Solar Energy in Nigeria: A Reliable Alternative To A Struggling Grid”
    //     https://energytracker.asia/solar-energy-nigeria/
    //
    // [6] Nairametrics – “Electricity update: Nigeria's power generation peaks to record high of 5,000 MW”
    //     https://nairametrics.com/2022/09/02/electricity-update-nigerias-power-generation-falls-massively-to-68856mwh/
    //
    // [7] Climate Scorecard – “50% of Vehicles in Nigeria Projected to be Locally Built or Assembled EVs in Ten Years”
    //     https://www.climatescorecard.org/2022/11/50-of-vehicles-in-nigeria-projected-to-be-locally-built-or-assembled-evs-in-tenyears/
    //
    // [8] “The Danfo – Nigeria In A Box” (context on minibus use)
    //     https://nigeriainabox.com/product/the-danfo/
    //
    // [9] “Annual average distance traveled of vehicle categories...” – ResearchGate figure
    //     https://www.researchgate.net/figure/Annual-average-distance-traveled-of-vehicle-categories-in-different-age-groups-onroad_fig4_355975590
    //
    // [10] FIA Foundation – Sub-Saharan motorcycle boom report
    //      https://www.fiafoundation.org/news/sub-saharan-motorcycle-boom-puts-lives-at-risk-warns-new-fia-foundation-report
    //
    // [11] “Nigerian Railway Spends About N4 Million On Diesel Alone Daily ...”
    //      (media report; diesel use on main line)
    //      https://www.facebook.com/photo.php?fbid=2111280142377168&id=1081062912065568&set=a.1104576799714179
    //
    // [12] “Energy Consumption in Transport Sector in Nigeria: Current Situation and Ways Forward”
    //      (ResearchGate)
    //      https://www.researchgate.net/publication/286928670_Energy_Consumption_in_Transport_Sector_in_Nigeria_Current_Situation_and_Ways_Forward


    Brazil: {
      electricity: {
        existingCarbonFreeElectricity: 620,
        // ~620 TWh/yr from carbon-free sources (hydro, wind, solar, nuclear, etc.) in 2022 [1][2][4][5]

        existingGasElectricity: 42,
        // ~42 TWh/yr from natural gas in 2022 [4][5]

        existingCoalElectricity: 8,
        // ~8 TWh/yr from coal in 2022 [4][5]

        currentWindCapacityGW: 33.7,
        // ~33.7 GW installed wind power capacity (approx. end of 2024) [3][4][5]

        currentSolarCapacityGW: 35.7,
        // ~35.7 GW installed solar power capacity (utility + distributed, ~2023) [1][4][5]

        lowDemandGW: 45,
        // ~45 GW estimated lowest system demand (overnight off-peak)

        lowDemandDuringDayGW: 55
        // ~55 GW estimated lowest daytime demand (with solar contribution)
      },

      heat: {
        residentialHeat: 210,
        // ~210 TWh/yr final energy for residential heating/cooking (electricity, LPG, biomass) [5]

        industryHeat: 840
        // ~840 TWh/yr final energy for industrial process heat (all fuels) [5]
      },

      // Default wind/solar capacity mix ratio in model (90% wind, 10% solar)
      windSolarRatio: 90,

      roadTransport: {
        cars: {
          numVehicles: 38400000,
          // ~38.4 million cars in circulation (2023) [6]

          distance: 10000,          // km per car per year
          kWhPerKm: 0.19,           // assumed electric consumption
          totalElectricity: 0,
          emissionsPerKm: 120       // gCO2/km tailpipe for cars (avg, approx.)
        },

        busesSmall: {
          numVehicles: 100000,
          // ~100k small buses/minibuses (subset of total buses, est.)

          distance: 30000,          // km per year
          kWhPerKm: 1.0,            // kWh/km for electric minibus (assumed)
          totalElectricity: 0,
          emissionsPerKm: 500       // gCO2/km diesel minibus (approx.)
        },

        busesLarge: {
          numVehicles: 290000,
          // ~290k large buses (city + intercity) – subset of ~388.9k total buses [6]

          distance: 60000,          // km per year
          kWhPerKm: 1.5,            // kWh/km for large e-bus (assumed)
          totalElectricity: 0,
          emissionsPerKm: 1000      // gCO2/km diesel bus (approx.)
        },

        lightGoods: {
          numVehicles: 6200000,
          // ~6.2 million light commercial vehicles (vans, pickups) in 2023 [6]

          distance: 15000,          // km per year
          kWhPerKm: 0.3,            // kWh/km for electric van (assumed)
          totalElectricity: 0,
          emissionsPerKm: 250       // gCO2/km diesel/gasoline van (approx.)
        },

        heavyGoods: {
          numVehicles: 2200000,
          // ~2.2 million heavy goods vehicles (trucks) in 2023 [6]

          distance: 50000,          // km per year
          kWhPerKm: 1.5,            // kWh/km for heavy e-truck (assumed)
          totalElectricity: 0,
          emissionsPerKm: 1000      // gCO2/km diesel truck (approx.)
        },

        tractors: {
          numVehicles: 1300000,
          // ~1.3 million agricultural tractors (~1.23M in 2017 census, rounded) [7]

          distance: 3000,           // equivalent km per year (estimated)
          kWhPerKm: 2.0,            // kWh/km for electric tractor (assumed)
          totalElectricity: 0,
          emissionsPerKm: 800       // gCO2/km diesel tractor (rough estimate)
        },

        motorcycles: {
          numVehicles: 13260000,
          // ~13.26 million motorcycles in circulation (2023) [6]

          distance: 5000,           // km per year
          kWhPerKm: 0.06,           // kWh/km for electric motorcycle (assumed)
          totalElectricity: 0,
          emissionsPerKm: 80        // gCO2/km gasoline motorcycle (approx.)
        },

        other: {
          numVehicles: 500000,
          // ~500k other vehicles (ATVs, micro-cars, special vehicles) – estimated

          distance: 5000,           // km per year
          kWhPerKm: 0.2,            // kWh/km (assumed avg)
          totalElectricity: 0,
          emissionsPerKm: 200       // gCO2/km mixed fleet (approx.)
        }
      },

      railDiesel: 960000000,
      // ~960 million litres diesel consumed by rail transport per year (~2% of diesel use) [5][8]

      shippingDiesel: 480000000
      // ~480 million litres diesel for domestic shipping per year (~1% of diesel use) [5][8]
    },

    // [1] “Brasil teve maior queda do mundo em emissões do setor elétrico em 2022”
    //     Canal Solar
    //     https://canalsolar.com.br/brasil-teve-maior-queda-do-mundo-em-emissoes-do-setor-eletrico-em-2022/
    //
    // [2] Newton Duarte – “Cogeração de energia ajuda país a enfrentar períodos de seca”
    //     https://www.poder360.com.br/opiniao/cogeracao-de-energia-ajuda-pais-a-enfrentar-periodos-de-seca/
    //
    // [3] “Brasil é o 5º em ranking mundial de capacidade de energia eólica em terra”
    //     https://amazonasatual.com.br/brasil-e-o-5o-em-ranking-mundial-de-capacidade-de-energia-eolica-em-terra/
    //
    // [4] Electricity sector in Brazil – Wikipedia
    //     https://en.wikipedia.org/wiki/Electricity_sector_in_Brazil
    //
    // [5] IEA Bioenergy – Country Report 2024: Brazil
    //     https://www.ieabioenergy.com/wp-content/uploads/2024/12/CountryReport2024_Brazil_final.pdf
    //
    // [6] “Frota circulante” – Sindipeças (vehicle fleet statistics, Brazil)
    //     https://www.sindipecas.org.br/sindinews/Economia/2024/Frota_Circulante.pdf
    //
    // [7] Ministério da Agricultura e Pecuária – agricultural machinery / tractor statistics
    //     https://www.gov.br/agricultura/pt-br/assuntos/inovacao/idagro
    //
    // [8] “A atividade de transportes consome mais de 80% do óleo diesel ...”
    //     (diesel use share in transport)
    //     https://www.instagram.com/p/DNBHH9RTw3p/

    Australia: {
      electricity: {
        existingCarbonFreeElectricity: 102.4,
        // ~102.4 TWh carbon-free generation (renewables ~36% of 284 TWh in 2024) [1][2][6]

        existingGasElectricity: 48.3,
        // ~48.3 TWh from gas (~17% of generation in 2024) [1][2]

        existingCoalElectricity: 127.8,
        // ~127.8 TWh from coal (~45% of generation in 2024) [1][2]

        currentWindCapacityGW: 13.3,
        // ~13.3 GW installed wind capacity (east & south grids, ~12–14 GW nationally) [3][5]

        currentSolarCapacityGW: 41.8,
        // ~41.8 GW solar PV (rooftop + utility) as of June 2025 [4]

        lowDemandGW: 10.1,
        // ~10.1 GW record low operational demand (midday, Oct 2024) [5]

        lowDemandDuringDayGW: 10.1
        // Same record low daytime trough — daytime demand now < overnight demand [5]
      },

      heat: {
        residentialHeat: 85,
        // ~85 TWh residential heating energy (space + water heating ~62% of household energy) [7]

        industryHeat: 234
        // ~234 TWh industrial process heat (~842 PJ; ~42% of industrial energy) [7]
      },

      windSolarRatio: 90,
      // Default assumed wind/solar ratio for new capacity (placeholder)

      roadTransport: {
        cars: {
          numVehicles: 15325339,
          // ~15.3 million passenger vehicles (2023) [8]

          distance: 11100,         // km/year per car (national average) [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 180      // gCO2/km (avg ICE car emissions) [10]
        },

        busesSmall: {
          numVehicles: 40000,
          // ~40k small buses (subset of ~98k total buses in 2023) [8]

          distance: 15000,         // km/year (light-duty mini-bus usage) [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 500      // gCO2/km diesel minibuses (approx.)
        },

        busesLarge: {
          numVehicles: 60000,
          // ~60k large buses (city + intercity, remainder from ~98k) [8]

          distance: 40000,         // km/year (urban & intercity buses) [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1100     // gCO2/km diesel bus (~40 L/100 km) [10]
        },

        lightGoods: {
          numVehicles: 3930000,
          // ~3.93 million light commercials (utes/vans) [8]

          distance: 15300,         // km/year [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 250      // gCO2/km diesel LDVs [10]
        },

        heavyGoods: {
          numVehicles: 600000,
          // ~600k freight trucks (rigid + articulated; ~592k rigid, ~105k artics) [8]

          distance: 30000,         // weighted average (rigids ~21k, artics ~78k) [9][12]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1300     // gCO2/km (~50 L/100 km ≈ 1350 g/km) [10][12]
        },

        tractors: {
          numVehicles: 100000,
          // ~100k agricultural tractors (rough estimate) [12]

          distance: 3000,          // km/year equivalent (mostly off-road use)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1500     // gCO2/km heavy diesel, low-speed usage (est.)
        },

        motorcycles: {
          numVehicles: 957693,
          // ~0.96 million motorcycles (2023) [8]

          distance: 1900,          // km/year average motorcycle use [9]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 100      // gCO2/km average motorcycle [10]
        },

        other: {
          numVehicles: 230000,
          // ~230k other vehicles (ATVs, forklifts, plant, misc.) [12]

          distance: 2000,
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 600      // gCO2/km mixed fleet, approximate
        }
      },

      railDiesel: 1000000000,
      // ~1.0 billion litres diesel used by rail (freight + regional). Rail used ~533M L in 2000–01; 
      // has since grown with freight task. [12]

      shippingDiesel: 500000000
      // ~0.5 billion litres diesel for domestic shipping (coastal freight, ferries) — rough estimate.
    },
    // [1] Australian Energy Statistics – Table O (Electricity generation by fuel type, 2023–24 & 2024)
    //     https://www.energy.gov.au/publications/australian-energy-statistics-table-o-electricity-generation-fuel-type-2023-24-and-2024
    //
    // [2] Electricity generation – energy.gov.au
    //     https://www.energy.gov.au/energy-data/australian-energy-statistics/electricity-generation
    //
    // [3] Wind power in Australia – Wikipedia
    //     https://en.wikipedia.org/wiki/Wind_power_in_Australia
    //
    // [4] Solar power in Australia – Wikipedia
    //     https://en.wikipedia.org/wiki/Solar_power_in_Australia
    //
    // [5] AEMO Quarterly Energy Dynamics (Q4 2024) – record low demand
    //     https://www.aemo.com.au/-/media/files/major-publications/qed/2024/qed-q4-2024.pdf
    //
    // [6] IEA – Australia 2023 Energy Policy Review
    //     https://iea.blob.core.windows.net/assets/02a7a120-564b-4057-ac6d-cf21587a30d9/Australia2023EnergyPolicyReview.pdf
    //
    // [7] CSIRO / ITP – Industrial Process Heat Market in Australia (SolarPACES)
    //     https://www.solarpaces.org/wp-content/uploads/2025/04/Australian-Industrial-Process-Heat-Market-CSIRO-ITP.pdf
    //
    // [8] BITRE – Road Vehicles Australia (2023 re-issue / 2024 update)
    //     https://www.bitre.gov.au/sites/default/files/documents/BITRE-Road-Vehicles-Australia-January-2023-Re-Issue.pdf
    //
    // [9] ABS – Survey of Motor Vehicle Use (SMVU)
    //     https://www.abs.gov.au/statistics/industry/tourism-and-transport/survey-motor-vehicle-use-australia/latest-release
    //
    // [10] Australian Green Vehicle Guide – Vehicle emissions
    //      https://www.greenvehicleguide.gov.au/pages/UnderstandingEmissions/VehicleEmissions
    //
    // [12] Australasian Transport Research Forum – “Australia’s Transport Tasks”
    //      https://australasiantransportresearchforum.org.au/wp-content/uploads/2022/03/2003_Laird.pdf


    US: {
      electricity: {
        existingCarbonFreeElectricity: 1742,
        // ~1742 TWh (2023) from nuclear + renewables, incl. ~74 TWh small-scale solar [1][2][3][4]

        existingGasElectricity: 1802,
        // ~1802 TWh (2023) generated from natural gas [1][3][4]

        existingCoalElectricity: 675,
        // ~675 TWh (2023) generated from coal [1][3][4]

        currentWindCapacityGW: 147.5,
        // ~147.5 GW installed wind capacity at end of 2023 [2][3]

        currentSolarCapacityGW: 139,
        // ~139 GW installed solar PV capacity at end of 2023 (utility + small-scale) [2]

        lowDemandGW: 300,
        // ~300 GW approximate lowest nationwide overnight demand (assumption)

        lowDemandDuringDayGW: 350
        // ~350 GW approximate lowest daytime demand on the grid (assumption)
      },

      heat: {
        residentialHeat: 1200,
        // ~1200 TWh/yr estimated residential space-heating energy (~34% of home energy use) [1][5]

        industryHeat: 5700
        // ~5700 TWh/yr estimated industrial process heat (~70% of industrial energy use) [1][5]
      },

      // Default assumed contribution split for wind + solar (model placeholder)
      windSolarRatio: 90,

      roadTransport: {
        cars: {
          numVehicles: 242000000,
          // ~242 million passenger vehicles (cars/SUVs/light-duty used for personal transport, 2021) [6][7]

          distance: 17000,        // km/year per car (~10.5k miles/year) [7]
          kWhPerKm: 0.19,         // EV energy use factor (kWh/km)
          totalElectricity: 0,
          emissionsPerKm: 250     // gCO2/km (~400 g/mi average gasoline car) [8]
        },

        busesSmall: {
          numVehicles: 300000,
          // ~0.3 million small buses (school/shuttle; subset of ~0.94M total buses) [6]

          distance: 25000,        // km/year (~15k miles/year for school/shuttle buses) [7]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 900     // gCO2/km diesel school bus (~7 mpg) [8]
        },

        busesLarge: {
          numVehicles: 639000,
          // ~0.64 million large buses (city transit + coaches; total buses ~939k) [6]

          distance: 60000,        // km/year (~37k miles/year transit/coach buses) [7]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1500    // gCO2/km diesel transit bus (~4 mpg) [8]
        },

        lightGoods: {
          numVehicles: 16000000,
          // ~16 million light goods vehicles (vans/pickups in commercial use) [6][7]

          distance: 20000,        // km/year (~12k miles/year) [7]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 300     // gCO2/km typical gasoline van/pickup [8]
        },

        heavyGoods: {
          numVehicles: 10700000,
          // ~10.7 million heavy-duty single-unit trucks (>10,000 lb GVW) [6][7]

          distance: 20000,        // km/year (~12k miles/year) [7]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 800     // gCO2/km diesel heavy truck (duty-cycle dependent) [8]
        },

        tractors: {
          numVehicles: 3143000,
          // ~3.14 million truck tractors (articulated semi-truck units) [6]

          distance: 100000,       // km/year (~62k miles/year for long-haul semi) [7]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1000    // gCO2/km diesel semi-truck (~6 mpg) [8]
        },

        motorcycles: {
          numVehicles: 8500000,
          // ~8.5 million on-road motorcycles in use (2021) [7]

          distance: 5000,         // km/year (~3k miles/year; declining usage) [7]
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 100     // gCO2/km (~100–150 g/km depending on engine size) [8]
        },

        other: {
          numVehicles: 1000000,
          // ~1 million other road vehicles (RVs, emergency, special-use; approx.) [6]

          distance: 5000,         // km/year (assumed low usage)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1000    // gCO2/km (assumed heavy/mixed fleet average)
        }
      },

      railDiesel: 14000000000,
      // ~14 billion litres/year diesel for rail transport (Class I freight ~13.5B L/yr) [9]

      shippingDiesel: 15000000000
      // ~15 billion litres/year diesel & bunker fuel for domestic shipping (order-of-magnitude est.) [1]
    },

    // [1] U.S. EIA – Frequently Asked Questions & national energy data (generation by fuel)
    //     https://www.eia.gov/tools/faqs/faq.php?id=427&t=3
    //
    // [2] Climate Central – “A Decade of Growth in Solar and Wind Power: Trends Across the U.S.”
    //     https://www.climatecentral.org/report/solar-and-wind-power-2024
    //
    // [3] EIA – “Wind generation declined in 2023 for the first time since the 1990s”
    //     https://www.eia.gov/todayinenergy/detail.php?id=61943
    //
    // [4] Energy in the United States – Wikipedia (overview of generation mix and totals)
    //     https://en.wikipedia.org/wiki/Energy_in_the_United_States
    //
    // [5] Southwest Energy Efficiency Project – “Electrification of industrial process heating”
    //     https://www.swenergy.org/electrification-of-industrial-process-heating/
    //
    // [6] FMCSA – “Pocket Guide to Large Truck and Bus Statistics 2023”
    //     https://www.fmcsa.dot.gov/sites/fmcsa.dot.gov/files/2024-04/FMCSA%20Pocket%20Guide%202023-FINAL%20508%20-%20April%202024.pdf
    //
    // [7] U.S. DOE / AFDC – “Average Annual Vehicle Miles Traveled by Major Vehicle Category”
    //     https://afdc.energy.gov/data/10309
    //
    // [8] U.S. EPA – “Greenhouse Gas Emissions from a Typical Passenger Vehicle”
    //     https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P100JPPH.TXT
    //
    // [9] BTS – “Table 4-17M: Class I Rail Freight Fuel Consumption and Travel”
    //     https://www.bts.gov/archive/publications/national_transportation_statistics/2010/table_04_17m


    Germany : {
      electricity: {
        existingCarbonFreeElectricity: 289.4, // renewable (254.7 TWh) + nuclear (34.7 TWh) generation (2022)
        existingGasElectricity: 79.0,        // natural gas generation (79.0 TWh in 2022)
        existingCoalElectricity: 179.9,      // lignite + hard coal generation (116.2 + 63.7 = 179.9 TWh in 2022)
        currentWindCapacityGW: 72.7,         // ~63.5 GW onshore + 9.2 GW offshore (2024/2025)
        currentSolarCapacityGW: 100.0,       // ~100 GW PV total capacity (as of end-2024)
        lowDemandGW: 0,                      // (no data found)
        lowDemandDuringDayGW: 0              // (no data found)
      },

      heat: {
        residentialHeat: 658.0, // final energy for household heating (~658 TWh)
        industryHeat: 654.0     // final energy for industrial heating (~654 TWh)
      },

      windSolarRatio: 90, // assumed default wind:solar ratio (90:10) in energy mix

      roadTransport: {
        cars: {
          numVehicles: 49e6,     // ~49 million passenger cars (2024)
          distance: 15000,       // ~15,000 km/year per car (typical annual mileage)
          kWhPerKm: 0.19,        // assumed EV consumption (0.19 kWh/km)
          totalElectricity: 0,   // (to be calculated)
          emissionsPerKm: 140    // ~140 gCO₂/km (fleet-average ICE cars, estimate)
        },
        busesSmall: {
          numVehicles: 1e4,      // ~10,000 small buses (minibuses, estimate)
          distance: 30000,       // ~30,000 km/year per small bus (estimate)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 900    // ~900 gCO₂/km (diesel minibus, estimate)
        },
        busesLarge: {
          numVehicles: 8.0e4,    // ~80,000 large buses/coaches (2021)
          distance: 20000,       // ~20,000 km/year per large bus (urban/coach average)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 1100   // ~1100 gCO₂/km (diesel coach/bus, estimate)
        },
        lightGoods: {
          numVehicles: 3.14e6,   // ~3.14 million vans (light commercial vehicles, 2021)
          distance: 20000,       // ~20,000 km/year per van
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 220    // ~220 gCO₂/km (diesel van, estimate)
        },
        heavyGoods: {
          numVehicles: 0.965e6,  // ~965,000 trucks (heavy goods, 2021)
          distance: 50000,       // ~50,000 km/year per truck (long-haul avg)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 900    // ~900 gCO₂/km (diesel truck, estimate)
        },
        tractors: {
          numVehicles: 0.4e6,    // ~400,000 agricultural tractors (estimate)
          distance: 5000,        // ~5,000 km/year per tractor (agricultural use)
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 3000   // ~3,000 gCO₂/km (diesel tractor, estimate)
        },
        motorcycles: {
          numVehicles: 2.35e6,   // ~2.35 million motorcycles/mopeds (2021)
          distance: 3000,        // ~3,000 km/year per motorcycle
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 100    // ~100 gCO₂/km (gasoline motorcycle, estimate)
        },
        other: {
          numVehicles: 0,        // other vehicle types (not specified)
          distance: 0,
          kWhPerKm: 0.19,
          totalElectricity: 0,
          emissionsPerKm: 0
        }
      },

      railDiesel: 1.80e8, // ~180 million litres diesel (DB: 19M l HVO = 9.6% of fuel ≈198M total)
      shippingDiesel: 0   // (no data found, placeholder)
    },


    // Sources (for reference only):
    // - Gross electricity production in Germany - German Federal Statistical Office
    //   https://www.destatis.de/EN/Themes/Economic-Sectors-Enterprises/Energy/Production/Tables/gross-electricityproduction.html
    // - Statistics Germany | BWE e.V.
    //   https://www.wind-energie.de/english/statistics/statistics-germany/
    // - Status of Offshore Wind Energy Development in Germany | German OFFSHORE-WINDENERGY Foundation
    //   http://www.offshore-stiftung.de/en/status-quo-offshore-windenergy.php
    // - German solar capacity breaches 100 gigawatts – industry association | Clean Energy Wire
    //   https://www.cleanenergywire.org/news/german-solar-capacity-breaches-100-gigawatts-industry-association
    // - Focus on Heating
    //   https://www.pwc.de/de/energiewirtschaft/pwc-energiewende-tracker-fokus-waerme.pdf
    // - Passenger cars in the EU - Statistics Explained - Eurostat
    //   https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Passenger_cars_in_the_EU
    // - ACEA report: Vehicles in use Europe 2023
    //   https://www.acea.auto/files/ACEA-report-vehicles-in-use-europe-2023.pdf
    // - Diesel phase-out | Deutsche Bahn Annual Report 2024
    //   https://ibir.deutschebahn.com/2024/en/combined-management-report/green-transformation/climate-protection/dieselphase-out/

    // Canada energy and transport data
    Canada: {
      electricity: {
        existingCarbonFreeElectricity: 517.3, // TWh (2022: ~61.3% hydro + 12.9% nuclear + 6.1% wind + 0.5% solar of 640.3 TWh total)
        existingGasElectricity: 58.4,        // TWh (approx 10% of 584 TWh total generation)
        existingCoalElectricity: 23.4,       // TWh (approx 4% of 584 TWh total generation)
        currentWindCapacityGW: 18.0,         // GW (installed wind capacity ≈18 GW as of 2023)
        currentSolarCapacityGW: 3.6,         // GW (≈2.4 GW utility-scale + 1.2 GW rooftop solar)
        lowDemandGW: 40,                     // GW (approx national off-peak demand, estimate)
        lowDemandDuringDayGW: 60             // GW (approx midday low demand, estimate)
      },

      heat: {
        residentialHeat: 196, // TWh (NatGas + heating oil in homes: ~54.2% of 1.3 million TJ energy use)
        industryHeat: 95      // TWh (NatGas in industry: ~9.0 Bcf/d ≈ 95 TWh/yr)
      },

      windSolarRatio: 90, // % (default wind:solar generation ratio)

      roadTransport: {
        cars: {
          numVehicles: 8614532,   // passenger cars (~8.6M; 36.5% of 23.6M LDVs in 2023)
          distance: 15000,        // km/year
          kWhPerKm: 0.19,         // EV energy use
          totalElectricity: 0,
          emissionsPerKm: 150     // g CO₂/km (ICE average)
        },
        busesSmall: {
          numVehicles: 15000,     // estimate
          distance: 30000,        // km/year
          kWhPerKm: 2.0,          // EV bus energy
          totalElectricity: 0,
          emissionsPerKm: 800     // g CO₂/km
        },
        busesLarge: {
          numVehicles: 20000,     // estimate
          distance: 30000,        // km/year
          kWhPerKm: 2.5,
          totalElectricity: 0,
          emissionsPerKm: 1000    // g CO₂/km
        },
        lightGoods: {
          numVehicles: 6500000,   // ~6.5M
          distance: 30000,        // km/year
          kWhPerKm: 0.3,
          totalElectricity: 0,
          emissionsPerKm: 250     // g CO₂/km
        },
        heavyGoods: {
          numVehicles: 1000000,   // ~1M heavy trucks
          distance: 50000,        // km/year
          kWhPerKm: 1.2,
          totalElectricity: 0,
          emissionsPerKm: 900     // g CO₂/km
        },
        tractors: {
          numVehicles: 659337,    // farm tractors (2021)
          distance: 2000,         // km/year
          kWhPerKm: 0.5,
          totalElectricity: 0,
          emissionsPerKm: 1000    // g CO₂/km
        },
        motorcycles: {
          numVehicles: 829892,    // motorcycles/mopeds (2022)
          distance: 5000,         // km/year
          kWhPerKm: 0.07,
          totalElectricity: 0,
          emissionsPerKm: 120     // g CO₂/km
        },
        other: {
          numVehicles: 100000,    // estimate
          distance: 10000,        // km/year
          kWhPerKm: 0.3,
          totalElectricity: 0,
          emissionsPerKm: 200     // g CO₂/km
        }
      },

      railDiesel: 2000000000,  // litres (≈2.0×10^9 L in 2021)
      shippingDiesel: 3000000000 // litres (marine diesel estimate)
    }

    // Sources (for reference only):
    // - Canada Energy Overview — trade.gov
    //   https://www.trade.gov/country-commercial-guides/canada-energy
    // - Canada's clean electricity future — Canada.ca
    //   https://www.canada.ca/en/services/environment/weather/climatechange/climate-plan/clean-electricity.html
    // - Onshore wind energy analysis — climateinstitute.ca
    //   https://climateinstitute.ca/safe-bets-wild-cards/onshore-wind-energy/
    // - Renewable growth 2023 — Canadian Renewable Energy Association
    //   https://renewablesassociation.ca/news-release-new-2023-data-shows-11-2-growth-for-wind-solar-energy-storage/
    // - Households & Environment Survey 2021 — StatCan
    //   https://www150.statcan.gc.ca/n1/daily-quotidien/240319/dq240319d-eng.htm
    // - CER Energy Profiles — CER
    //   https://www.cer-rec.gc.ca/en/data-analysis/energy-markets/provincial-territorial-energy-profiles/provincial-territorial-energyprofiles-canada.html
    // - Vehicle registrations 2023 — StatCan
    //   https://www150.statcan.gc.ca/n1/daily-quotidien/241021/dq241021c-eng.htm
    // - Motorcycles 2022 — Statistics Canada
    //   https://www.statcan.gc.ca/o1/en/plus/5335-more-motorcycles-mopeds-canadian-roads-2022
    // - Rail Trends 2022 — railcan.ca
    //   https://www.railcan.ca/wp-content/uploads/2023/01/SPARK-RAC-RAIL-TRENDS-2022-EN8-1.pdf








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
      const pumpedHydroRoundTripEff = 0.77; 
      storageNeededPerDayGWh = storageNeededPerDayGWh / pumpedHydroRoundTripEff;

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

      // --- HOW MUCH OF THE DAILY SURPLUS CAN BE STORED BY WIND VS SOLAR? ---
      const totalStoreablePerDay =
        (totalWindCanBeStoredPerDay || 0) + (totalSolarCanBeStoredPerDay || 0);

      // Guard against divide-by-zero (e.g., if both are zero, split 50/50 for math to proceed)
      let windContribution = 0.5;
      let solarContribution = 0.5;
      if (totalStoreablePerDay > 0) {
        windContribution  = (totalWindCanBeStoredPerDay || 0) / totalStoreablePerDay;
        solarContribution = (totalSolarCanBeStoredPerDay || 0) / totalStoreablePerDay;
      }

      // ❗ KEY CHANGE: targets are **per day**, not “days * per day”
      const windTargetPerDay_GWh  = storageNeededPerDayGWh * windContribution;
      const solarTargetPerDay_GWh = storageNeededPerDayGWh * solarContribution;

      // Window lengths & effective performance
      const H_wind  = averageHoursPerdayCanStoreWind;   // 8 h
      const H_solar = averageHoursPerdayCanStoreSolar;  // 6 h
      const etaWind  = averagePerformanceDuringExcessProductionHoursWind;   // 0.7
      const etaSolar = averagePerformanceDuringExcessProductionHoursSolar;  // 0.5

      // Base loads during those windows (GW)
      const L_night = projectedLowerPowerDemandAtNightGW;
      const L_day   = projectedLowerPowerDemandDuringDayGW;

      // Existing nameplate before storage-driven bump (GW)
      const W_base = (formData.electricity.currentWindCapacityGW || 0) + extraWindCapacityGW;
      const S_base = (formData.electricity.currentSolarCapacityGW || 0) + extraSolarCapacityGW;

      // Required *charging rate* to meet the **daily** target within the charging windows (GW)
      const windRequiredRateGW  = windTargetPerDay_GWh  / H_wind;  // GWh / h = GW
      const solarRequiredRateGW = solarTargetPerDay_GWh / H_solar; // GWh / h = GW

      // Nameplate to achieve that surplus during charging window:
      // eta * Nameplate - BaseLoad = RequiredRate  =>  Nameplate = (RequiredRate + BaseLoad)/eta
      const W_req = (windRequiredRateGW  + L_night) / etaWind;
      const S_req = (solarRequiredRateGW + L_day)   / etaSolar;

      // Shortfalls to add (never negative)
      const addWindGW  = Math.max(0, W_req - W_base);
      const addSolarGW = Math.max(0, S_req - S_base);

      // Add the storage-driven increments on top of the non-storage extra
      extraWindCapacityGW  += addWindGW;
      extraSolarCapacityGW += addSolarGW;

      // ---------- DEBUG (updated to PER-DAY targets) ----------
      console.log('--- STORAGE DEBUG ---');
      console.log({
        totalEnergyOfNewGrid_TWh: totalEnergyOfNewGrid,
        storageDuration_days: storageDuration,
        storageNeededPerDay_GWh: storageNeededPerDayGWh,
        totalWindCanBeStoredPerDay_GWh: totalWindCanBeStoredPerDay,
        totalSolarCanBeStoredPerDay_GWh: totalSolarCanBeStoredPerDay,
        windContribution, solarContribution,

        // PER-DAY targets (correct)
        windTargetPerDay_GWh, solarTargetPerDay_GWh,

        averageHoursPerdayCanStoreWind: H_wind,
        averageHoursPerdayCanStoreSolar: H_solar,
        averagePerformanceDuringExcessProductionHoursWind: etaWind,
        averagePerformanceDuringExcessProductionHoursSolar: etaSolar,

        projectedLowerPowerDemandAtNightGW: L_night,
        projectedLowerPowerDemandDuringDayGW: L_day,

        W_base_GW: W_base,
        S_base_GW: S_base,

        windRequiredRateGW,
        solarRequiredRateGW,

        W_req_GW: W_req,
        S_req_GW: S_req,

        addWindGW, addSolarGW,

        // Volume still uses total days (correct)
        note: 'Reservoir energy scales with days; charging rate is per-day',
      });
      console.log('--- END STORAGE DEBUG ---');


      //m = E/g*h
      const E = storageNeededPerDayGWh * storageDuration * 3.6 * 1000000000000;


      const g = 9.8;
      const h = lakeHeightDifference;

      const m = E / (g * h);

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
        label: "Existing Gas-Powered Electricity",
        data: [
          newGrid.existingGasElectricity ? newGrid.existingGasElectricity : 0,
          0,
        ],
        backgroundColor: "#b0c4de", // light steel-ish blue for gas
      },
      {
        label: "Existing Coal-Powered Electricity",
        data: [
          newGrid.existingCoalElectricity ? newGrid.existingCoalElectricity : 0,
          0,
        ],
        backgroundColor: "#a9a9a9", // darker gray for coal
      },
      {
        label: "Gas (Converted to Renewable)",
        data: [
          0,
          newGrid.existingGasElectricity ? newGrid.existingGasElectricity : 0,
        ],
        backgroundColor: "#8BC34A",
      },
      {
        label: "Coal (Converted to Renewable)",
        data: [
          0,
          newGrid.existingCoalElectricity ? newGrid.existingCoalElectricity : 0,
        ],
        backgroundColor: "#7CB342",
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
    labels: ["Current Emissions"],
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
        label: "Electricity Emissions (Gas)",
        data: [
          newGrid.existingGasElectricityEmissions
            ? newGrid.existingGasElectricityEmissions
            : 0,
          0,
        ],
        backgroundColor: "#9CC4FF", // gas
      },
      {
        label: "Electricity Emissions (Coal)",
        data: [
          newGrid.existingCoalElectricityEmissions
            ? newGrid.existingCoalElectricityEmissions
            : 0,
          0,
        ],
        backgroundColor: "#6E6E6E", // coal
      },
      {
        label: "Existing Heat Emissions",
        data: [
          newGrid.existingHeatEmissions ? newGrid.existingHeatEmissions : 0,
          0,
        ],
        backgroundColor: "#607D8B", // Blue-gray for heat
      },

    ].filter((dataset) => dataset.data.some((value) => value > 0)), // Only include datasets with data > 0
  };

    const existingCarbonFreeTWh =
    (processedData?.datasets?.[0]?.data?.[0] || 0);

  const requiredCarbonFreeTWh = processedData?.datasets
    ? processedData.datasets.reduce((acc, dataset) => {
        const value = Number(dataset?.data?.[1]) || 0;
        return acc + value;
      }, 0)
    : 0;

  const progressToNetZero =
    requiredCarbonFreeTWh > 0
      ? (existingCarbonFreeTWh / requiredCarbonFreeTWh) * 100
      : 0;

  const progressLabel = selectedCountry || "This country";


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
            Net Zero Calculator
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
          <button
            onClick={() => setShowContribute(!showContribute)}
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
            Contribute
          </button>
        </div>
      </div>

      {showMethodology && <Methodology />}
      {showContact && <Contact />}
      {showContribute && <Contribute />}

      <div className="country-dropdown-container">
        <label htmlFor="country-select" className="dropdown-label">
          Select Country or enter your own data for a country:
        </label>


          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <select
              id="country-select"
              value={selectedCountry}
              onChange={handleCountryChange}
              className="country-dropdown"
            >

            <option value="Australia">Australia</option>

            <option value="Brazil">Brazil</option>

            <option value="Canada">Canada</option>

            <option value="Germany">Germany</option>

            <option value="Ireland">Ireland</option>

            <option value="Nigeria">Nigeria</option>

            <option value="Spain">Spain</option>

            <option value="UK">UK</option>

            <option value="US">US</option>

              
              <option value="">No Country</option>
            </select>

            <button onClick={handleClearCountry} className="clear-button">
              Clear
            </button>

            {/* 🔹 Compact progress badge beside Clear */}
            {requiredCarbonFreeTWh > 0 && (
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg, rgba(0,123,255,0.1), rgba(0,188,212,0.2))",
                  border: "1px solid #00BCD4",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#005b73",
                  whiteSpace: "nowrap",
                }}
              >
                {progressLabel} is{" "}
                {Number.isFinite(progressToNetZero)
                  ? progressToNetZero.toFixed(1)
                  : "0.0"}
                % to Net Zero
              </div>
            )}
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
              <label style={{ textAlign: "right", marginRight: "10px", color: "#424242", display: "flex", alignItems: "center" }}>
                Gas-Powered Electricity Per Annum (TWh):
              </label>
              <input
                type="number"
                value={formData.electricity.existingGasElectricity}
                onChange={(e) =>
                  handleChange(e, "existingGasElectricity", "electricity")
                }
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #CCC",
                  maxWidth: "120px",
                  boxSizing: "border-box",
                }}
              />

              <label style={{ textAlign: "right", marginRight: "10px", color: "#424242", display: "flex", alignItems: "center" }}>
                Coal-Powered Electricity Per Annum (TWh):
              </label>
              <input
                type="number"
                value={formData.electricity.existingCoalElectricity}
                onChange={(e) =>
                  handleChange(e, "existingCoalElectricity", "electricity")
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

              <label style={{ textAlign: "left" }}>
                Wind Share of New Renewables (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={windSolarRatio}
                onChange={(e) =>
                  handleParameterChange(setWindSolarRatio, parseFloat(e.target.value))
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
                <label style={{ textAlign: "left" }}>
                  Number of Storage Days:
                </label>
                <input
                  type="number"
                  value={storageDuration}
                  onChange={(e) => setStorageDuration(parseFloat(e.target.value))}
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

          {/* 🔷 NEW PROMINENT BOX 🔷 */}
          <div
            style={{
              marginTop: "10px",
              padding: "15px 20px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #003366, #00BCD4)",
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: "1.1rem",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            {progressLabel} is{" "}
            {Number.isFinite(progressToNetZero)
              ? progressToNetZero.toFixed(1)
              : "0.0"}
            % to Net Zero.
            </div>

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
                    {Math.round(newGrid?.volumeOfWater / 2500).toLocaleString()}
                  </span>{" "}
                  Olympic swimming pools
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

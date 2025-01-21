import React from 'react';

function Methodology() {
  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <p>
        This app was inspired by a novel, bottom-up approach used in a paper titled 
        "Bottom-up estimation of the scope of tasks to completely phase out fossil fuels in Finland"
        by Simon Michaux, Tere Vadén, Janne M. Korhonen, and Jussi T. Eronen. 
        The paper can be seen <a href="https://www.sciencedirect.com/science/article/pii/S2211467X23002110">here</a>.
        </p>
      <h2>Methodology - References for Calculations</h2>
      <ul>
        <li>
          <h2>Methodology for Electricity</h2>
          <p>To replace fossil fuel-based electricity generation with wind and solar, the calculator estimates 
            the required capacity and infrastructure. For instance, a country generating 20 TWh of electricity annually from fossil 
            fuels can calculate the wind turbines required as follows:</p>
       <ul>
      
              <li><strong>Total electricity demand:</strong> 20 TWh per year.</li>
              <li><strong>Proportion replaced by wind:</strong> 90% .</li>
              <li><strong>Wind turbine capacity factor:</strong> 34% (B4).</li>
          </ul>
          <p>The required wind capacity (in GW) is calculated as:</p>
          <pre>Capacity (GW) = TWh / hours in the year * 1000 * proportion to be provided by wind / capacity factor</pre>
          <p>For this example:</p>
          <pre>Capacity = 20 ÷ 8760 × 1000 ÷ 34% ≈ 6.04 GW</pre>
          <p>The number of turbines is estimated using:</p>
          <pre>Number of Turbines = (Capacity × 1000) ÷ Turbine Capacity (MW)</pre>
          <p>For this example:</p>
          <pre>Number of Turbines = (6.04 × 1000) ÷ 6.6 ≈ 916 turbines</pre>
          <p>This methodology provides an estimate for infrastructure needs based on typical turbine capacity and performance.</p>
          <p>For calculating the number of solar panels required, 400W panels are used.</p>
       </li>
        <li>
        <h2>Methodology for Heat Electrification</h2>
        <ul>
          <li>
            <strong>Home/Office Heating:</strong> 
            Heating demand is divided by a Coefficient of Performance (COP) of 4, assuming all buildings are retrofitted with insulation. 
            <br />
            <em>Formula:</em> Electricity (TWh) = Heating Demand (TWh) ÷ COP (4)
          </li>
          <li>
            <strong>Industry Heat:</strong> 
            For every 1 TWh of fossil fuel heat, 1 TWh of electricity is required, assuming resistance heating or equivalent electrification methods.
          </li>
        </ul>
        </li>
        <li>
        <h2>Methodology for Rail Electrification</h2>
          <p>
            The energy demand of diesel-powered rail transport is calculated based on fuel consumption data. 
            Diesel efficiency is assumed to be 45%, and electric traction efficiency is 73%.
            The electricity required to replace diesel is adjusted for a 10% grid transmission loss. 
            The conversion ensures that the same level of service is provided with electrified rail systems.
          </p>
          <p>
            <em>Formula:</em> 
            <br />
            Electricity (TWh) = Diesel Energy (TWh) × (Diesel Efficiency ÷ Electric Efficiency) ÷ (1 - Transmission Loss)
          </p>
        </li>

        <li>
        <h2>Methodology for Shipping Electrification</h2>
          <p>
          Since there is no technology available yet for replacing fuel oil with EV batteries in long distance shipping, hydrogen fuel cells were used as the replacement technology in shipping.

          The starting point is litres of diesel. Since 1 litre of diesel weighs 0.84kg, and assuming that for diesel (marine gas oil) the calorific content is 12.75 kWh/kg, 
          the TWh of fuel oil used for shipping in a year is determined. 38% efficiency is applied to determine useful work in TWh. 1kg of 
          hydrogen produces 15 kWh of electricity in a PEM hydrogen cell. To find the amount of hydrogen needed, 15kWh is divided into the TWh of useful work to give the kg of hydrogen required. 52.5 kwh of electricity is needed to produce 1 kg of hydrogen, so from this, the amount of electricity required to replace fuel oil in shipping is computed.
          </p>
  
        </li>

        <li>
        <h2>Electric Vehicle (EV) Energy Consumption</h2>
        The following kWh/km values are used for working out the electricity required to replace fossil fuels in road transport:
        <ul>
            <li>Cars: 0.19</li>
            <li>Small buses: 0.23</li>
            <li>Large buses: 4.63 (hydrogen fuel cell)</li>
            <li>Light Goods Vehicles: 0.23</li>
            <li>Heavy Goods Vehicles: 4.63 (hydrogen fuel cell)</li>
            <li>Tractors: 4.63 (hydrogen fuel cell)</li>
            <li>Motorcycles: 0.11</li>
            <li>Other vehicles: 0.23</li>
        </ul>


    <h2>Hydrogen Fuel Cell Energy Consumption</h2>
    <p>
        For vehicles requiring higher energy density (e.g., HGVs, large buses, tractors), hydrogen fuel cells are used. 
        Calculations:

        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
              <tr>
                  <th>Hydrogen</th>
                  <th>Units</th>
                  <th>Outcome</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td>Consumption of hydrogen if vehicle was a FCEV</td>
                  <td>kg/km</td>
                  <td>0.0802</td>
              </tr>
              <tr>
                  <td>Required Electric power to manufacture one Kg H2 with electrolysis</td>
                  <td>kWh</td>
                  <td>50</td>
              </tr>
              <tr>
                  <td>Required Electric power to compress H2 into tanks at 700 bar pressure</td>
                  <td>kWh</td>
                  <td>2.5</td>
              </tr>
              <tr>
                  <td>kWh / kg</td>
                  <td></td>
                  <td>52.5</td>
              </tr>
              <tr>
                  <td>kWh / km</td>
                  <td></td>
                  <td>4.63155</td>
              </tr>
          </tbody>
      </table>


        Adjusted for grid losses:
        <code>
            Adjusted Electricity for H2 Production (kWh) = Electricity for H2 Production × 1.1
        </code>
    </p>



        </li>

        <li>


        <h2>Methodology for Pumped Storage</h2>
        <ul>

  <li>
    <strong>Storage Needed per Day:</strong>
    <p>
      The total energy demand of the new grid is divided by 365 (days in a year) to calculate the energy that needs to be stored per day. 
      This value is adjusted for energy losses during conversion from pumped hydro storage to electricity, assuming a 70% efficiency.
    </p>
  </li>

  <li>
    <strong>Wind Storage Capacity:</strong>
    <p>
      The current wind capacity is combined with any additional wind capacity added to the grid. It is assumed that the wind energy system operates at 
      70% efficiency during hours of excess production. The projected lower power demand at night (scaled to match the expected increase in grid size) 
      is subtracted from this capacity to determine the amount of wind energy that can be stored daily. The calculation assumes that wind energy can be stored for 8 hours per day.
    </p>
  </li>

  <li>
    <strong>Solar Storage Capacity:</strong>
    <p>
      The current solar capacity is combined with any additional solar capacity added to the grid. It is assumed that the solar energy system operates at 
      50% efficiency during hours of excess production. The projected lower power demand during the day (scaled to match the expected increase in grid size) 
      is subtracted from this capacity to determine the amount of solar energy that can be stored daily. The calculation assumes that solar energy can be stored for 6 hours per day.
    </p>
  </li>

  <li>
    <strong>Proportion of Wind and Solar Contributions:</strong>
    <p>
      The proportion of wind and solar energy contributing to the storage requirement is calculated based on the daily storage capacities of wind and solar. 
      The total energy storage requirement is then divided proportionally between wind and solar contributions.
    </p>
  </li>

  <li>
    <strong>Capacity Increases Needed:</strong>
    <p>
      The additional capacity required for wind and solar is calculated by comparing the current storage capacity to the target storage requirement. 
      The percentage increase needed for wind and solar capacity is determined, and these percentages are applied to the extra capacity to meet the targets.
    </p>
  </li>

  <li>
    <strong>Energy Stored as Potential Energy:</strong>
    <p>
      The total energy to be stored is converted to joules. Using the gravitational potential energy formula, the mass of water needed for storage is calculated:
    </p>
    <pre>m = E / (g × h)</pre>
    <ul>
      <li>E = energy to be stored (in joules)</li>
      <li>g = 9.8 m/s² (acceleration due to gravity)</li>
      <li>h = height difference between the upper and lower reservoirs (in meters)</li>
    </ul>
  </li>

  <li>
    <strong>Volume of Water:</strong>
    <p>
      The volume of water is calculated from the mass, assuming a density of 1,000 kg per cubic meter:
    </p>
    <pre>volumeOfWater = m / 1000</pre>
    <p>
      The final result is rounded up to the nearest cubic meter to ensure sufficient storage.
    </p>
  </li>
</ul>


        </li>

 

      </ul>
    </div>






  );
}

export default Methodology;

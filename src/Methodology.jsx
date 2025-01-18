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
          <p>To replace fossil fuel-based electricity generation with renewable sources such as wind and solar, the calculator estimates 
            the required capacity and infrastructure. For instance, a country generating 20 TWh of electricity annually from fossil 
            fuels can calculate the wind turbines required as follows:</p>
       <ul>
      
              <li><strong>Total electricity demand:</strong> 20 TWh per year.</li>
              <li><strong>Proportion replaced by wind:</strong> 90% .</li>
              <li><strong>Wind turbine capacity factor:</strong> 34% (B4).</li>
          </ul>
          <p>The required wind capacity (in GW) is calculated as:</p>
          <pre>Capacity (GW) = TWh / hours in the year * 1000 * proportio to be provided by wind / capacity factor</pre>
          <p>For this example:</p>
          <pre>Capacity = 20 ÷ 8760 × 1000 ÷ 34% ≈ 6.04 GW</pre>
          <p>The number of turbines is estimated using:</p>
          <pre>Number of Turbines = (Capacity × 1000) ÷ Turbine Capacity (MW)</pre>
          <p>For this example:</p>
          <pre>Number of Turbines = (6.04 × 1000) ÷ 6.6 ≈ 916 turbines</pre>
          <p>This methodology provides an estimate for infrastructure needs based on typical turbine capacity and performance.</p>
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
      </ul>
    </div>






  );
}

export default Methodology;

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
        <h2>Methodology for Road Transport</h2>
        <p>
          It was assumed all vehicles would be replaced by lithium-ion EV's. Note: It may be the case that long all heavy vehicles will be replaced by hydrogen fuel cells as they have a better energy density. Calculation for producing the hydrogen necessary are below.

        </p>

        <table border="1" cellspacing="0" cellpadding="6">
          <thead>
            <tr>
              <th>Vehicle category</th>
              <th>kWh/km</th>
              <th>Emissions (g CO₂/km)</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cars</td>
              <td>0.19</td>
              <td>168</td>
              <td>EV Database, 2024; Suarez et al, 2025</td>
            </tr>
            <tr>
              <td>Buses (small)</td>
              <td>0.23</td>
              <td>180.8</td>
              <td>EV Database, 2024; European Environment Agency, 2025</td>
            </tr>
            <tr>
              <td>Buses (large) <strong>*</strong></td>
              <td>1.2</td>
              <td>822</td>
              <td>MAN Truck & Bus, 2025; Carbon Independent, 2025a</td>
            </tr>
            <tr>
              <td>Light Goods Vehicles</td>
              <td>0.23</td>
              <td>180.8</td>
              <td>EV Database, 2024; assume same as small buses</td>
            </tr>
            <tr>
              <td>Heavy Goods Vehicles <strong>*</strong></td>
              <td>1.2</td>
              <td>900</td>
              <td>MAN Truck & Bus, 2025; 57 g CO₂/t-km × 16 t (Ragon &amp; Rodriguez, 2021)</td>
            </tr>
            <tr>
              <td>Tractors <strong>*</strong></td>
              <td>1.2</td>
              <td>900</td>
              <td>MAN Truck & Bus, 2025; assume same as HGV</td>
            </tr>
            <tr>
              <td>Motorcycles</td>
              <td>0.11</td>
              <td>46.5</td>
              <td>EV Database, 2024; Gantina et al, 2024</td>
            </tr>
            <tr>
              <td>Other Vehicles</td>
              <td>0.23</td>
              <td>180.8</td>
              <td>EV Database, 2024; assume same as LGV</td>
            </tr>
          </tbody>
        </table>
        <strong>*To be replaced with Hydrogen Fuel Cells</strong>
        <br />


          <table border="1" cellspacing="0" cellpadding="6">
            <thead>
              <tr>
                <th>Type</th>
      
                <th>Emissions (g CO₂/km)</th>
         
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gas for electricity</td>
                <td>450 (California Air Resources Board, 2024)</td>
       
              </tr>
              <tr>
                <td>Coal for electricity</td>
                <td>975 (Xia, 2013)</td>

              </tr>
              <tr>
                <td>Gas for heat</td>
                <td>185 (EEA Grants)</td>

              </tr>

              <tr>
              <td>Diesel combustion</td>
              <td>2,620 (Kawamoto et al, 2019)</td>              
              </tr>
        
      
            </tbody>
          </table>

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
                  <td>5.19155</td>
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

      <ul>
      <li>
      Carbon Independent (2025a) Emissions from bus travel. Available at: https://www.carbonindependent.org/20.html 
      </li>

      <li>
        Suarez, J., Tansini, A., Ktistakis, M.A., Marin, A.L., Komnos, D., Pavlovic, J. & Fontaras, G. (2025) ‘Towards zero CO₂ emissions: Insights from EU vehicle on-board data’, Science of The Total Environment, 1001, p.180454. doi:10.1016/j.scitotenv.2025.180454.
      </li>

      <li>
      European Environment Agency (2025) CO₂ performance — emissions of new passenger cars and vans. Available at: https://www.eea.europa.eu/en/analysis/indicators/co2-performance-emissions-of-new 
      </li>

      <li>
      Ragon, PL & Rodriguez, F. (2021). CO2 emissions from trucks in the EU: An analysis of the heavy-duty CO2 standards baseline data. Available at: https://www.researchgate.net/publication/355046265_CO2_emissions_from_trucks_in_the_EU_An_analysis_of_the_heavy-duty_CO2_standards_baseline_data 
      </li>

      <li>
        Gantina, T.M., Lestari, P., Arrohman, M.K., Mahalana, A. and Dallmann, T. (2024) Measurement of motorcycle exhaust emissions on urban roads using remote sensing. E3S Web of Conferences, 15, 06009. Available at: https://www.e3s-conferences.org/articles/e3sconf/pdf/2024/15/e3sconf_etmc2024_06009.pdf
      </li>

      <li>
EEA Grants, Conversion Guidelines – Greenhouse gas emissions, (n.d.), “1 MWh from gas fired power plant = 185 kg CO₂”, viewed DD Month YYYY, https://www.eeagrants.gov.pt/media/2776/conversion-guidelines.pdf

      </li>

      <li>
California Air Resources Board (2024) Low Carbon Fuel Standard Annual Updates to Lookup Table Pathways. “Electricity generation emission factor = 450 gCO₂e/kWh (Weighted average emissions factor of each NG combustion type).” Available at: https://ww2.arb.ca.gov/sites/default/files/classic/fuels/lcfs/fuelpathways/comments/2024_elec_update.pdf
      </li>

      <li>
Xia, M., et al. (2013) ‘Carbon emission coefficient measurement of the coal-to-power chain in China’, Applied Energy, 103, pp. 606–613.
      </li>

      <li>
Kawamoto, R., Mochizuki, H., Moriguchi, Y., Nakano, T., Motohashi, M., Sakai, Y., & Inaba, A. (2019). Estimation of CO2 Emissions of Internal Combustion Engine Vehicle and Battery Electric Vehicle Using LCA. Sustainability, 11(9), 2690. https://doi.org/10.3390/su11092690
      </li>

      <li>
MAN Truck & Bus (2025) MAN eTrucks: Already over 5 million kilometres in customer use. 04 September 2025. Available at: https://press.mantruckandbus.com/corporate/man-etrucks-already-over-5-million-kilometres-in-customer-use/
 (Accessed: 31 October 2025).
      </li>

      </ul>
    </div>






  );
}

export default Methodology;

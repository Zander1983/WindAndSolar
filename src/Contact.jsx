import React from 'react';

function Contact() {
  return (
    <div
      style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        border: '1px solid #757575',
      }}
    >
      <h2 style={{ color: '#616161' }}>Add Your Country</h2>
      <p style={{ fontSize: '16px', color: '#424242', lineHeight: '1.6' }}>
        If you would like to add your own country to the app, please email me at{' '}
        <a href="mailto:markkelly1983@yahoo.co.uk" style={{ color: '#007BFF' }}>
          markkelly1983@yahoo.co.uk
        </a>{' '}
        with the country’s data formatted as JSON, using the example below:
      </p>
      <pre
        style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflowX: 'auto',
          fontSize: '14px',
          color: '#212121',
          border: '1px solid #ddd',
        }}
      >
{`{
  "Ireland": {
    "electricity": {
      "existingCarbonFreeElectricity": 12.63,
      "existingFossilFuelElectricity": 21.25,
      "currentWindCapacityGW": 5.585,
      "currentSolarCapacityGW": 1.185
    },
    "heat": {
      "residentialHeat": 36.08,
      "industryHeat": 19.88
    },
    "windSolarRatio": 90,
    "roadTransport": {
      "cars": { "numVehicles": 2255971, "distance": 16352 },
      "busesSmall": { "numVehicles": 21457, "distance": 39504 },
      "busesLarge": { "numVehicles": 11206, "distance": 34965 },
      "lightGoods": { "numVehicles": 220056, "distance": 20615 },
      "heavyGoods": { "numVehicles": 146704, "distance": 20615 },
      "tractors": { "numVehicles": 84170, "distance": 2000 },
      "motorcycles": { "numVehicles": 41471, "distance": 2741 },
      "other": { "numVehicles": 101676, "distance": 20391 }
    },
    "railDiesel": 43800000,
    "shippingDiesel": 107376283
  }
}`}
      </pre>
    </div>
  );
}

export default Contact;

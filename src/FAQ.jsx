import React from 'react';

function FAQ() {
  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <h2>FAQ - References for Calculations</h2>
      <ul>
        <li>
          <strong>Electricity:</strong> Data is based on national grid statistics and average household consumption.
        </li>
        <li>
          <strong>Heat:</strong> Heat energy values are derived from average fuel consumption rates for heating.
        </li>
        <li>
          <strong>Transport:</strong> Vehicle numbers and average kilometers are sourced from government transport surveys.
        </li>
      </ul>
    </div>
  );
}

export default FAQ;

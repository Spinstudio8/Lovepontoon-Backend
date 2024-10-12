const generateEmailHtml = (reservation, payment, booking) => {
    const currentYear = new Date().getFullYear();

  return `
    <div style="font-family: Arial, sans-serif; padding: 12px; background: #eaf0f3;">
      <div style="text-align: center;">
        <h1 style="color: #00d4ff; font-size: 24px;">Love<span style="color: #202020;">Pontoon</span></h1>
        <p style="color: #000; font-size: 16px;">Olusegun Obasanjo Presidential Library (OOPL)</p>
      </div>
      <div style="background-color: #fff; padding: 12px; border-radius: 6px; margin: 20px 0;">
        <h1 style="text-align: center; font-size: 18x;">E-TICKET</h1>
        <div style="padding: 12px; border: 1px solid rgba(189, 189, 189, 0.5);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #0578ff; font-size: 16px;">${reservation.name}</h3>
            <p style="color: #202020;">Transaction ID: <strong>${payment.transactionId}</strong></p>
            <h4>12430 - OOPL PUN AC SF</h4>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4>Date:</h4>
                <p>${payment.date}</p>
              </div>
              <div>
                <h4>Time:</h4>
                <p>${reservation.time}</p>
              </div>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <h1 style="font-size: 20px;">Booker Details</h1>
            <h3>${booking.userName}</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-direction: column">
              <div>
                <p>Age: <strong>${payment.age} Yrs</strong></p>
                <p>Gender: <strong>${payment.gender}</strong></p>
              </div>
              <h4>Booking Status: <span style="color: #31a91d;">Confirmed</span> (CNF)</h4>
            </div>
            <div>
              <h4>Number of Guests:</h4>
              <h4>${payment.noOfGuests} (including yourself)</h4>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <h3>Total Booking Payment:</h3>
            <h3>N ${payment.amount}</h3>
          </div>
        </div>
        <div style="margin-top: 20px;">
          <h3>Important Information:</h3>
          <p>Please bring this e-ticket along with a valid ID proof for verification at the entrance.</p>
          <p>Entry Time: (15 minutes before the event start time).</p>
          <p>No re-entry allowed after exit.</p>
          <p>We look forward to welcoming you and your guests!</p>
          <p>Lovepontoon, OOPL</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p>Copyright © ${currentYear}. All Rights Reserved.</p>
        <h5 style="color: #00d4ff;">Love<span style="color: #202020;">Pontoon</span></h5>
      </div>
    </div>
  `;
};

module.exports = { generateEmailHtml };

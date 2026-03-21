const STUDENT_DATABASE = {
  20223723: {
    fullName: "Adefaka Mosimiloluwa",
    department: "Mathematics",
    level: "400 Level",
    phoneNumber: "+234 123 456 7890",
  },
  20223702: {
    fullName: "Soremi Ayomide Olufolaranmi",
    department: "Computer Science",
    level: "400 Level",
    phoneNumber: "+234 812 345 6789",
  },
  20221045: {
    fullName: "Ayomide Cole",
    department: "Agricultural Engineering",
    level: "200 Level",
    phoneNumber: "+234 803 456 7890",
  },
};

const BASE = process.env.API_URL || "http://localhost:3000";

let authToken = "";

async function req(method, path, body) {
  const url = `${BASE}${path}`;
  const init = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  };
  if (body) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed with status ${res.status}: ${text}`);
  }
  return await res.json();
}

async function main() {
  console.log("Populating backend with mock data from STUDENT_DATABASE...");

  // 1. Create Users from STUDENT_DATABASE
  for (const [matric, student] of Object.entries(STUDENT_DATABASE)) {
    try {
      const email = `${matric}@funaab.edu.ng`;
      const pin = "1234"; // Default PIN for all mock users

      console.log(`Creating user: ${student.fullName} (${matric})...`);

      // Register
      const regRes = await req("POST", "/api/users/register", {
        matricNumber: matric,
        pin: pin,
        email: email,
        fullName: student.fullName,
        department: student.department,
        level: student.level,
        phoneNumber: student.phoneNumber,
      });

      // Extract OTP from hint if possible
      let otp = "123456"; // Default fallback
      if (regRes.hint && regRes.hint.includes("DEV: ")) {
        otp = regRes.hint.replace("DEV: ", "");
      }

      // Verify OTP
      await req("POST", "/api/users/verify-otp", {
        email: email,
        otp,
      });

      console.log(`Verified user: ${student.fullName}`);

      // 2. If the student is a known driver in our mock data, promote to driver
      // For this demo, let's make the first two students drivers
      const isDriver = matric === "20223723" || matric === "20223702";

      if (isDriver) {
        // Login to get ID and Token
        const loginRes = await req("POST", "/api/users/login", {
          matricNumber: matric,
          pin: pin,
        });

        if (loginRes.user && loginRes.token) {
          authToken = loginRes.token;
          const userId = loginRes.user.id;

          // Create Driver Profile
          await req("POST", "/api/drivers/profile", {
            vehicleMake: "Toyota",
            vehicleModel: matric === "20223723" ? "Camry" : "Corolla",
            vehicleColor: "Silver",
            plateNumber: matric === "20223723" ? "ABC-123" : "XYZ-789",
            licenseNumber: "LIC-" + matric,
            vehicleType: "car",
            maxPassengers: 4,
            baseFare: 200,
            perKmRate: 50,
            perMinuteRate: 10,
          });

          // Update profile to be online and verified
          await req("PATCH", "/api/users/profile", {
            userId: userId,
            isDriver: true,
            isKYCVerified: true,
          });

          // Update driver status to ONLINE
          const driverId = loginRes.user.driverProfile?.id || 1; // Fallback or fetch
          // In a real scenario we'd get the driver ID from the profile creation response
          console.log(`Promoted to driver: ${student.fullName}`);
        }
      }
    } catch (e) {
      console.error(
        `Failed to process student ${student.fullName}:`,
        e.message,
      );
    }
  }

  // 3. Create Vouchers
  const vouchers = [
    {
      code: "WELCOME50",
      discount: 50,
      description: "₦50 off your first ride",
      expiresAt: "2026-12-31",
    },
    {
      code: "CAMPUS",
      discount: 100,
      description: "₦100 off any campus ride",
      expiresAt: "2026-06-30",
    },
  ];

  for (const voucher of vouchers) {
    try {
      await req("POST", "/api/vouchers", voucher);
      console.log(`Created voucher: ${voucher.code}`);
    } catch (e) {
      console.error(`Failed to create voucher ${voucher.code}:`, e.message);
    }
  }

  console.log("Population complete!");
}

main().catch(console.error);

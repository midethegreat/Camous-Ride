import { API_URL } from "@/constants/apiConfig";

type BankDetails = {
  accountNumber: string;
  bankCode: string;
  accountName: string;
};

export async function addBankAccount(details: BankDetails, userId: string) {
  const res = await fetch(`${API_URL}/api/bank/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...details, userId }),
  });
  if (!res.ok) {
    let msg = "Failed to add bank account";
    try {
      const data = await res.json();
      msg = data.message ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

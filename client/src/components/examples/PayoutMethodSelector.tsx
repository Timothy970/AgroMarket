import { useState } from 'react';
import PayoutMethodSelector, { PayoutMethod } from '../PayoutMethodSelector';

export default function PayoutMethodSelectorExample() {
  const [method, setMethod] = useState<PayoutMethod>('mobile_money');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  return (
    <div className="max-w-2xl">
      <PayoutMethodSelector
        selectedMethod={method}
        onMethodChange={setMethod}
        mobileNumber={mobileNumber}
        onMobileNumberChange={setMobileNumber}
        bankAccount={bankAccount}
        onBankAccountChange={setBankAccount}
        bankName={bankName}
        onBankNameChange={setBankName}
        paypalEmail={paypalEmail}
        onPaypalEmailChange={setPaypalEmail}
      />
    </div>
  );
}

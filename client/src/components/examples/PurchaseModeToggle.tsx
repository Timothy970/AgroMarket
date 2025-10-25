import { useState } from 'react';
import PurchaseModeToggle, { PurchaseMode } from '../PurchaseModeToggle';

export default function PurchaseModeToggleExample() {
  const [mode, setMode] = useState<PurchaseMode>('small');

  return (
    <div className="max-w-2xl">
      <PurchaseModeToggle
        mode={mode}
        onModeChange={setMode}
        smallPrice={200}
        smallUnit="kg"
        bulkPrice={4500}
        bulkUnit="25kg sack"
      />
    </div>
  );
}

const collections = [
  'bg-0', 'bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5', 'bg-6', 'bg-7', 'bg-8', 'bg-9', 'bg-10', 'bg-11', 'bg-12', 'bg-13', 'bg-14', 'bg-15', 'bg-16', 'bg-17', 'bg-18', 'bg-19', 'bg-20',
  'skin-0', 'skin-1', 'skin-2', 'skin-3', 'skin-4', 'skin-5', 'skin-6', 'skin-7', 'skin-8', 'skin-9', 'skin-10', 'skin-11', 'skin-12', 'skin-13', 'skin-14', 'skin-15', 'skin-16', 'skin-17', 'skin-18', 'skin-19', 'skin-20',
  'boom-0', 'boom-1', 'boom-2', 'boom-3', 'boom-4', 'boom-5', 'boom-6', 'boom-7', 'boom-8', 'boom-9', 'boom-10', 'boom-11', 'boom-12', 'boom-13', 'boom-14', 'boom-15', 'boom-16', 'boom-17', 'boom-18', 'boom-19', 'boom-20',
  'plate-0', 'plate-1', 'plate-2', 'plate-3', 'plate-4', 'plate-5', 'plate-6', 'plate-7', 'plate-8', 'plate-9', 'plate-10', 'plate-11', 'plate-12', 'plate-13', 'plate-14', 'plate-15', 'plate-16', 'plate-17', 'plate-18', 'plate-19', 'plate-20'
];

collections.forEach(id => {
  if (id.startsWith('bg-')) {
    const t = parseInt((id||"").replace('bg-', '')) || 0;
    if (t !== parseInt(id.replace('bg-', ''))) console.log('ERROR bg:', id, t);
  }
  if (id.startsWith('skin-')) {
    const t = parseInt((id||"").replace('skin-', '')) || 0;
    if (t !== parseInt(id.replace('skin-', ''))) console.log('ERROR skin:', id, t);
  }
  if (id.startsWith('boom-')) {
    const t = parseInt((id||"").replace('boom-', '')) || 0;
    if (t !== parseInt(id.replace('boom-', ''))) console.log('ERROR boom:', id, t);
  }
  if (id.startsWith('plate-')) {
    const t = parseInt((id||"").replace('plate-', '')) || 0;
    if (t !== parseInt(id.replace('plate-', ''))) console.log('ERROR plate:', id, t);
  }
});
console.log('Done testing IDs');

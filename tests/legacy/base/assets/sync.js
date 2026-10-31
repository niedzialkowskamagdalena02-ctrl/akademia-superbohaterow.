// Future sync boundary. Replace this adapter with authenticated cloud transport.
// Do NOT store private credentials in client JS. Backend must enforce parent/child permissions.
export const syncAdapter={
  status:()=> 'Chmura nie jest podłączona.',
  async onLocalChange(_state){return {synced:false,reason:'local-only'}},
  async connect(_credentials){throw Error('Wymaga wdrożenia bezpiecznego backendu i kont użytkowników')}
};

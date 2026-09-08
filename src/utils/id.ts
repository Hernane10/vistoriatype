// Short, non-cryptographic unique id — used for inspections, ambientes,
// items, keys, media, etc. Only needs to be unique within one person's data.
export const uid = () => Math.random().toString(36).slice(2, 10);

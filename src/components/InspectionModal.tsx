import React, { useState, useEffect } from 'react';
import {
  uid,
  TEMPLATES,
  FIELD_OPTIONS,
  withDefaults,
  type Inspection,
  type Item,
} from '../data/inspectionModel';

// ==========================================
// COMPONENTE: INSPECTIONMODAL
// ==========================================
interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionData?: Inspection;
  onSave: (updatedInspection: Inspection) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  isOpen,
  onClose,
  inspectionData,
  onSave,
}) => {
  const [inspection, setInspection] = useState<Inspection>(() =>
    withDefaults(inspectionData)
  );
  const [activeEnvIndex, setActiveEnvIndex] = useState<number>(0);
  const [newItemName, setNewItemName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setInspection(withDefaults(inspectionData));
      setActiveEnvIndex(0);
    }
  }, [isOpen, inspectionData]);

  if (!isOpen) return null;

  const currentEnv = inspection.environments?.[activeEnvIndex];

  const currentEnvItems =
    inspection.items?.filter(
      (item) =>
        item.environmentId === currentEnv?.id ||
        (currentEnv?.key && item.environmentKey === currentEnv.key)
    ) || [];

  const handlePopulateDefaultItems = () => {
    if (!currentEnv) return;
    const envKey = (currentEnv.key?.toLowerCase() ||
      currentEnv.name?.toLowerCase()) as keyof typeof TEMPLATES;
    const templateItems = TEMPLATES[envKey] || TEMPLATES.default;

    const newItems: Item[] = templateItems.map((itemName: string) => ({
      id: uid(),
      environmentId: currentEnv.id,
      environmentKey: currentEnv.key,
      name: itemName,
      status: 'BOM',
      observations: '',
      photos: [],
    }));

    setInspection((prev) => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setInspection((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !currentEnv) return;

    const newItem: Item = {
      id: uid(),
      environmentId: currentEnv.id,
      environmentKey: currentEnv.key,
      name: newItemName.trim(),
      status: 'BOM',
      observations: '',
      photos: [],
    };

    setInspection((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setNewItemName('');
  };

  const handleSaveAndClose = () => {
    onSave(inspection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border dark:border-zinc-800">
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              Vistoria: {inspection.title}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Gerenciamento de itens por ambiente
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold text-xl p-1"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 overflow-x-auto">
          {inspection.environments?.map((env, index) => {
            const itemCount =
              inspection.items?.filter(
                (i) =>
                  i.environmentId === env.id ||
                  (env.key && i.environmentKey === env.key)
              ).length || 0;

            return (
              <button
                key={env.id || index}
                onClick={() => setActiveEnvIndex(index)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeEnvIndex === index
                    ? 'border-amber-600 text-amber-600 bg-white dark:bg-zinc-900'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>{env.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {itemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentEnv ? (
            <div className="text-center py-12 text-zinc-500">
              Nenhum ambiente selecionado.
            </div>
          ) : currentEnvItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6">
              <p className="text-zinc-700 dark:text-zinc-300 font-medium text-lg mb-2">
                Nenhum item cadastrado para o ambiente "{currentEnv.name}".
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Carregue os itens padrão recomendados para iniciar a vistoria deste ambiente.
              </p>
              <button
                type="button"
                onClick={handlePopulateDefaultItems}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Carregar Itens Padrão de {currentEnv.name}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentEnvItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-zinc-800 pb-3">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      {FIELD_OPTIONS.status.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleItemChange(item.id, 'status', status)}
                          className={`px-3 py-1 text-xs font-bold rounded-md border transition-all ${
                            item.status === status
                              ? status === 'BOM'
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                : status === 'REGULAR'
                                ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                : status === 'RUIM'
                                ? 'bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                                : 'bg-zinc-200 border-zinc-400 text-zinc-800'
                              : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={item.observations || ''}
                      onChange={(e) =>
                        handleItemChange(item.id, 'observations', e.target.value)
                      }
                      placeholder={`Observações técnicas sobre ${item.name.toLowerCase()}...`}
                      className="w-full p-2.5 text-sm border dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentEnv && (
            <form onSubmit={handleAddNewItem} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Adicionar item personalizado em ${currentEnv.name}...`}
                className="flex-1 p-2.5 text-sm border dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 hover:bg-zinc-700 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                + Adicionar Item
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={activeEnvIndex === 0}
              onClick={() => setActiveEnvIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 border dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={
                activeEnvIndex ===
                (inspection.environments?.length || 1) - 1
              }
              onClick={() =>
                setActiveEnvIndex((prev) =>
                  Math.min(
                    (inspection.environments?.length || 1) - 1,
                    prev + 1
                  )
                )
              }
              className="px-4 py-2 border dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Próximo
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionModal;
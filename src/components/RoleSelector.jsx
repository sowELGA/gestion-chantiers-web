export default function RoleSelector({ allRoles, selectedRoles, onChange }) {
  const isSelected = (roleId) => selectedRoles.some((r) => r.id === roleId);
  const selectedRole = (roleId) => selectedRoles.find((r) => r.id === roleId);

  const hasExclusifSelected = selectedRoles.some((r) => {
    const role = allRoles.find((ar) => ar.id === r.id);
    return role?.exclusif;
  });

  const toggleRole = (role) => {
    if (isSelected(role.id)) {
      onChange(selectedRoles.filter((r) => r.id !== role.id));
      return;
    }

    if (role.exclusif) {
      // Un rôle exclusif remplace TOUTE la sélection
      onChange([{ id: role.id }]);
    } else {
      onChange([
        ...selectedRoles,
        {
          id: role.id,
          ...(role.nom === "daf"
            ? { gere_approvisionnements: false, gere_depenses: false }
            : {}),
        },
      ]);
    }
  };

  const updateDafFlag = (roleId, flag, value) => {
    onChange(
      selectedRoles.map((r) => (r.id === roleId ? { ...r, [flag]: value } : r)),
    );
  };

  const rolesNonExclusifs = allRoles.filter((r) => !r.exclusif);
  const rolesExclusifs = allRoles.filter((r) => r.exclusif);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Rôles administratifs (cumulables)
        </p>
        <div className="space-y-2">
          {rolesNonExclusifs.map((role) => {
            const selection = selectedRole(role.id);
            return (
              <div
                key={role.id}
                className="border border-slate-200 rounded-md p-3"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected(role.id)}
                    disabled={hasExclusifSelected}
                    onChange={() => toggleRole(role)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-800">{role.libelle}</span>
                </label>

                {role.nom === "daf" && isSelected(role.id) && (
                  <div className="ml-6 mt-2 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selection?.gere_approvisionnements}
                        onChange={(e) =>
                          updateDafFlag(
                            role.id,
                            "gere_approvisionnements",
                            e.target.checked,
                          )
                        }
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs text-gray-600">
                        Gère les approvisionnements
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selection?.gere_depenses}
                        onChange={(e) =>
                          updateDafFlag(
                            role.id,
                            "gere_depenses",
                            e.target.checked,
                          )
                        }
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs text-gray-600">
                        Gère les dépenses
                      </span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Rôles de terrain (exclusifs, non cumulables)
        </p>
        <div className="space-y-2">
          {rolesExclusifs.map((role) => (
            <label
              key={role.id}
              className={`flex items-center gap-2 border border-slate-200 rounded-md p-3 cursor-pointer ${
                selectedRoles.length > 0 &&
                !isSelected(role.id) &&
                hasExclusifSelected
                  ? "opacity-50"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="role-exclusif"
                checked={isSelected(role.id)}
                onChange={() => toggleRole(role)}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-800">{role.libelle}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedRoles.length === 0 && (
        <p className="text-xs text-red-500">Sélectionnez au moins un rôle.</p>
      )}
    </div>
  );
}

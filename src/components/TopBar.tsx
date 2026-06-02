import AddAssetButton from "./AddAssetButton";
import DepartmentDropdown from "./DepartmentDropdown";
import FilterButton from "./FilterButton";
import MoreOptionsButton from "./MoreOptionsButton";
import SearchBar from "./SearchBar";

interface TopBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  departments: string[];
  activeDept: string;
  onDepartmentChange: (value: string) => void;
  onAddAsset: () => void;
}

export default function TopBar({
  searchTerm,
  onSearchTermChange,
  departments,
  activeDept,
  onDepartmentChange,
  onAddAsset,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-[160] bg-transparent pt-4">
      <div className="flex w-full flex-col items-stretch justify-between gap-[0.9rem] md:flex-row md:items-center">
        <SearchBar value={searchTerm} onChange={onSearchTermChange} />
        <div className="flex w-full flex-wrap items-center gap-[0.55rem] md:ml-auto md:w-auto md:flex-nowrap md:justify-end">
          <FilterButton />
          <DepartmentDropdown
            departments={departments}
            activeDepartment={activeDept}
            onDepartmentChange={onDepartmentChange}
          />
          <AddAssetButton onClick={onAddAsset} />
          <MoreOptionsButton />
        </div>
      </div>
    </div>
  );
}

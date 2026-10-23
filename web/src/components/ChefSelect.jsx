import React, { useEffect, useId, useRef, useState } from "react";
import { filterChefs } from "../utils/search";

export default function ChefSelect({ value, chefs, loading, error, onRetry, onChange, invalid, describedBy })
{
  const listId = useId();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = chefs.find((chef) => String(chef.id) === String(value));
  const filtered = filterChefs(chefs, query);
  const activeId = open && filtered[activeIndex] ? `${listId}-${filtered[activeIndex].id}` : undefined;

  useEffect(() =>
  {
    inputRef.current?.setCustomValidity(selected ? "" : "Vui lòng chọn một đầu bếp trong danh sách.");
  }, [selected]);

  useEffect(() =>
  {
    if (!open || !window.matchMedia("(max-width: 768px)").matches)
    {
      return;
    }
    function revealSearch()
    {
      inputRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
    revealSearch();
    window.visualViewport?.addEventListener("resize", revealSearch);
    return () =>
    {
      window.visualViewport?.removeEventListener("resize", revealSearch);
    };
  }, [open]);

  useEffect(() =>
  {
    if (activeId)
    {
      const option = document.getElementById(activeId);
      const list = listRef.current;
      if (option && list)
      {
        if (option.offsetTop < list.scrollTop)
        {
          list.scrollTop = option.offsetTop;
        }
        else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight)
        {
          list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
        }
      }
    }
  }, [activeId]);

  function showOptions()
  {
    setQuery("");
    setActiveIndex(chefs.findIndex((chef) => String(chef.id) === String(value)));
    setOpen(true);
  }

  function choose(chef)
  {
    onChange(String(chef.id));
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(event)
  {
    if (event.nativeEvent.isComposing)
    {
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp")
    {
      event.preventDefault();
      if (!open)
      {
        showOptions();
      }
      else
      {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((index) =>
        {
          if (!filtered.length)
          {
            return -1;
          }
          return index < 0 ? (direction > 0 ? 0 : filtered.length - 1) : (index + direction + filtered.length) % filtered.length;
        });
      }
    }
    else if (event.key === "Enter")
    {
      event.preventDefault();
      if (open && filtered[activeIndex])
      {
        choose(filtered[activeIndex]);
      }
      else if (!open)
      {
        showOptions();
      }
    }
    else if (event.key === "Escape")
    {
      event.preventDefault();
      setOpen(false);
    }
    else if (event.key === "Tab")
    {
      setOpen(false);
    }
  }

  return (
    <div className="chef-select" onBlur={(event) =>
    {
      if (!event.currentTarget.contains(event.relatedTarget))
      {
        setOpen(false);
      }
    }}>
      <input type="hidden" name="chefId" value={value} />
      <input
        ref={inputRef}
        id="chefId"
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-required="true"
        aria-invalid={invalid || undefined}
        aria-describedby={`${listId}-selection ${describedBy}`}
        aria-busy={loading}
        className={`form-control ${invalid ? "is-invalid" : ""}`}
        value={open ? query : selected?.name || ""}
        placeholder={loading ? "Đang tải đầu bếp…" : "Tìm theo tên hoặc chuyên môn…"}
        onFocus={showOptions}
        onClick={() =>
        {
          if (!open)
          {
            showOptions();
          }
        }}
        onChange={(event) =>
        {
          setQuery(event.target.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {error && (
        <div className="chef-select-status" role="alert">
          Không thể tải danh sách đầu bếp. Lựa chọn hiện tại được giữ lại.
          <button type="button" className="btn--retry" onClick={onRetry} disabled={loading}>Thử lại</button>
        </div>
      )}
      {open && (
        <>
          <div className="chef-select-status" role="status">
            {loading ? "Đang tải danh sách đầu bếp…" : error ? "Vui lòng thử tải lại danh sách." : filtered.length ? `${filtered.length} đầu bếp. Dùng phím lên/xuống và Enter để chọn.` : "Không tìm thấy đầu bếp phù hợp."}
          </div>
          <ul ref={listRef} id={listId} className="chef-select-list" role="listbox" aria-label="Đầu bếp phụ trách">
            {!loading && !error && filtered.map((chef, index) => (
              <li key={chef.id} role="presentation">
                <button
                  id={`${listId}-${chef.id}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={String(chef.id) === String(value)}
                  className={`chef-select-option ${index === activeIndex ? "is-active" : ""}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(chef)}
                >
                  <strong>{chef.name}{String(chef.id) === String(value) ? " ✓" : ""}</strong>
                  <span>{chef.specialty || "Đầu bếp"}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div id={`${listId}-selection`} className="chef-select-selection" aria-live="polite">
        {selected ? <><strong>Đã chọn: {selected.name}</strong><span>{selected.specialty || "Đầu bếp"}</span></> : value ? `Đầu bếp #${value}${loading ? " — đang tải thông tin…" : " — chưa có thông tin, vui lòng thử tải lại hoặc chọn đầu bếp khác."}` : "Chưa chọn đầu bếp."}
      </div>
    </div>
  );
}

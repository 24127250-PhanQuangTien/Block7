import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { normalizeSearch } from "../utils/search";
import { getSelectPosition } from "../utils/selectPosition";

export default function SelectField({ id, name, value, options, onChange, className = "", labelledBy, describedBy })
{
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ text: "", time: 0 });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const listId = `${id}-options`;

  function showOptions()
  {
    setActiveIndex(Math.max(0, selectedIndex));
    setPosition(null);
    setOpen(true);
  }

  function choose(index)
  {
    if (options[index])
    {
      onChange(options[index].value);
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    }
  }

  useLayoutEffect(() =>
  {
    if (!open)
    {
      return;
    }
    function updatePosition()
    {
      const trigger = triggerRef.current;
      const list = listRef.current;
      if (!trigger || !list)
      {
        return;
      }
      const visual = window.visualViewport;
      const viewport = {
        left: visual?.offsetLeft || 0,
        top: visual?.offsetTop || 0,
        width: visual?.width || document.documentElement.clientWidth,
        height: visual?.height || window.innerHeight,
      };
      const anchor = trigger.getBoundingClientRect();
      const navbarBottom = document.querySelector(".navbar")?.getBoundingClientRect().bottom || 0;
      list.style.width = `${Math.min(anchor.width, Math.max(0, viewport.width - 16))}px`;
      const next = getSelectPosition(anchor, viewport, navbarBottom, list.scrollHeight + 2);
      if (!next)
      {
        setOpen(false);
        return;
      }
      setPosition(next);
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);
    return () =>
    {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [open, options]);

  useEffect(() =>
  {
    if (!open)
    {
      return;
    }
    function closeOutside(event)
    {
      if (!triggerRef.current?.contains(event.target) && !listRef.current?.contains(event.target))
      {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOutside, true);
    document.addEventListener("focusin", closeOutside);
    return () =>
    {
      document.removeEventListener("pointerdown", closeOutside, true);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  useLayoutEffect(() =>
  {
    const list = listRef.current;
    const option = list?.children[activeIndex];
    if (open && list && option)
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
  }, [open, activeIndex, position?.maxHeight]);

  function handleKeyDown(event)
  {
    const key = event.key;
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(key))
    {
      event.preventDefault();
    }
    if (key === "Escape" || key === "Tab")
    {
      setOpen(false);
    }
    else if (key === "Enter" || key === " ")
    {
      if (open)
      {
        choose(activeIndex);
      }
      else
      {
        showOptions();
      }
    }
    else if (key === "ArrowDown" || key === "ArrowUp")
    {
      if (!open)
      {
        showOptions();
      }
      else if (options.length)
      {
        setActiveIndex((index) => (index + (key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
      }
    }
    else if (key === "Home" || key === "End")
    {
      if (!open)
      {
        showOptions();
      }
      setActiveIndex(key === "Home" ? 0 : options.length - 1);
    }
    else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey)
    {
      event.preventDefault();
      const now = Date.now();
      const text = (now - typeahead.current.time < 700 ? typeahead.current.text : "") + key;
      typeahead.current = { text, time: now };
      const index = options.findIndex((option) => normalizeSearch(option.label).startsWith(normalizeSearch(text)));
      if (!open)
      {
        showOptions();
      }
      if (index >= 0)
      {
        setActiveIndex(index);
      }
    }
  }

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        className={`select-control ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && options[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        onClick={() => open ? setOpen(false) : showOptions()}
        onKeyDown={handleKeyDown}
      >
        <span>{options[selectedIndex]?.label || "Chọn…"}</span>
        <span className="select-control-arrow" aria-hidden="true"><ChevronDown className="ui-icon" aria-hidden="true" /></span>
      </button>
      {open && createPortal(
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelledBy || id}
          className="select-popup"
          style={position || { visibility: "hidden" }}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`select-popup-option ${index === activeIndex ? "is-active" : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              {option.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

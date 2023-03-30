import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export function DropdownItem(props) {
  const { icon, children, text, subText, className, onClick } = props;

  const itemClassName = classnames('dropdown-item__item', className, {
    'dropdown-item__item--clickable': Boolean(onClick),
  });
  return children ? (
    <div className={itemClassName} onClick={onClick}>
      {children}
    </div>
  ) : (
    <button className={itemClassName} onClick={onClick}>
      {icon ? <div className="dropdown-item__item__icon">{icon}</div> : null}
      {text ? <div className="dropdown-item__item__text">{text}</div> : null}
      {subText ? (
        <div className="dropdown-item__item__subtext">{subText}</div>
      ) : null}
    </button>
  );
}

DropdownItem.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
  text: PropTypes.node,
  subText: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

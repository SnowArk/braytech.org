import React from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { orderBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import { DestinyItemType, enumerateVendorItemStatus, enumerateItemState } from '../../utils/destinyEnums';
import { displayValue } from '../../utils/destinyConverters';
import itemComponents from '../../utils/destinyItems/itemComponents';
import { sockets } from '../../utils/destinyItems/sockets';
import { stats } from '../../utils/destinyItems/stats';
import { masterwork } from '../../utils/destinyItems/masterwork';
import { getOrnamentSocket } from '../../utils/destinyItems/utils';
import ObservedImage from '../../components/ObservedImage';
import ProgressBar from '../../components/UI/ProgressBar';
import { Common } from '../../svg';

import './styles.css';

const bucketsToExcludeFromInstanceProgressDisplay = [
  4274335291, // Emblems
];

function socketsUrl(itemHash, sockets, selectedSockets, socketIndex, plugHash) {
  if (!sockets?.length) {
    return {
      url: `/inspect/${itemHash}`,
      sockets: ''
    }
  };

  const socketsString = sockets.map((socket, s) => {
    return socket.plug?.definition?.hash || '';
  });

  // create strings
  return {
    url: `/inspect/${itemHash}?sockets=${socketsString.join('/')}`,
    sockets: socketsString.join('/')
  };
}

function Items({ member, items, handler, tooltips, order, noBorder, showQuantity, hideQuantity, asPanels, placeholders = 0, showHash, selfLinkFrom, inspect }) {
  const location = useLocation();

  if (!items || !items.length) {
    console.warn('No items specified');

    return null;
  }

  const output = items.map((item, i) => {
    const definitionItem = item?.itemHash && (manifest.DestinyInventoryItemDefinition[item.itemHash] || manifest.BraytechDefinition[item.itemHash]);

    if (!definitionItem) {
      console.log(`Items: Couldn't find item definition for:`, item);

      return false;
    }

    item.itemComponents = itemComponents(item, member);
    item.sockets = sockets(item);
    item.stats = stats(item);
    item.masterwork = masterwork(item);

    const vendorItemStatus = item.unavailable === undefined && item.saleStatus && enumerateVendorItemStatus(item.saleStatus);

    const masterworked = enumerateItemState(item.state).Masterworked || (!item.itemInstanceId && (definitionItem.itemType === DestinyItemType.Armor ? item.masterwork?.stats?.filter((s) => s.value > 9).length : item.masterwork?.stats?.filter((s) => s.value >= 9).length));
    const locked = enumerateItemState(item.state).Locked;
    const tracked = enumerateItemState(item.state).Tracked;

    const ornamentSocket = item.sockets && getOrnamentSocket(item.sockets);

    const icon = definitionItem.displayProperties.localIcon ? `${definitionItem.displayProperties.icon}` : ornamentSocket?.plug?.definition?.displayProperties?.icon ? `https://www.bungie.net${ornamentSocket.plug.definition.displayProperties.icon}` : `https://www.bungie.net${definitionItem.displayProperties.icon}`;

    return {
      name: definitionItem.displayProperties.name,
      tierType: definitionItem.inventory?.tierType,
      element: (
        <li
          key={i}
          className={cx(
            {
              linked: true,
              masterworked,
              tracked,
              exotic: definitionItem.inventory && definitionItem.inventory.tierType === 6,
              'no-border': (definitionItem.uiItemDisplayStyle === 'ui_display_style_engram' && item.bucketHash !== 3284755031) || (definitionItem.itemCategoryHashes && definitionItem.itemCategoryHashes.includes(268598612)) || (definitionItem.itemCategoryHashes && definitionItem.itemCategoryHashes.includes(18)) || noBorder,
              unavailable: (vendorItemStatus && !vendorItemStatus.Success) || item.unavailable,
            },
            `item-type-${definitionItem.itemType || 0}`
          )}
          data-tooltip={tooltips !== undefined ? tooltips : true}
          data-hash={item.itemHash}
          data-instanceid={item.itemInstanceId}
          data-state={item.state}
          data-quantity={item.quantity && item.quantity > 1 ? item.quantity : null}
          data-vendorhash={item.vendorHash}
          data-vendoritemindex={item.vendorItemIndex}
          data-vendorsalestatus={item.saleStatus}
          data-failureindexes={item.failureIndexes && JSON.stringify(item.failureIndexes)}
          onClick={handler ? handler(item) : undefined}
        >
          <div className='icon'>
            <ObservedImage className='image' src={icon} />
          </div>
          {tracked ? (
            <div className='item-state tracked'>
              <Common.Tracking />
            </div>
          ) : null}
          {locked ? (
            <div className='item-state locked'>
              <Common.ItemStateLocked />
            </div>
          ) : null}
          {asPanels ? (
            <div className='text'>
              <div className='name'>{definitionItem.displayProperties.name}</div>
              {showHash ? <div className='hash'>{definitionItem.hash}</div> : null}
            </div>
          ) : null}
          {item.itemComponents?.objectives && item.itemComponents?.objectives.filter((o) => !o.complete).length > 0 && !bucketsToExcludeFromInstanceProgressDisplay.includes(item.bucketHash) ? (
            <ProgressBar
              progress={{
                progress: item.itemComponents?.objectives.reduce((acc, curr) => {
                  return acc + curr.progress;
                }, 0),
                objectiveHash: item.itemComponents?.objectives[0].objectiveHash,
              }}
              objective={{
                completionValue: item.itemComponents?.objectives.reduce((acc, curr) => {
                  return acc + curr.completionValue;
                }, 0),
              }}
              hideCheck
            />
          ) : null}
          {(showQuantity || item.quantity > 1) && !hideQuantity ? <div className={cx('quantity', { 'max-stack': definitionItem.inventory && definitionItem.inventory.maxStackSize === item.quantity })}>{displayValue(item.quantity || 0)}</div> : null}
          {inspect ? <Link to={{ pathname: `/inspect/${item.itemHash}`, search: `?sockets=${socketsUrl(item.itemHash, item.sockets.sockets).sockets}`, state: { from: selfLinkFrom || location.pathname } }} /> : null}
        </li>
      ),
    };
  });

  const elements = order
    ? // filter blanks, order, and output
      orderBy(
        output.filter((item) => item),
        [(item) => item[order], (item) => item.name],
        ['desc', 'asc']
      ).map((item) => item.element)
    : // filter blanks and output
      output.filter((item) => item).map((item) => item.element);

  if (placeholders > 0) {
    while (elements.length < placeholders) {
      elements.push(<li key={elements.length} className='placeholder' />);
    }
  }

  return elements;
}

function mapStateToProps(state) {
  return {
    member: state.member,
  };
}

export default connect(mapStateToProps)(Items);

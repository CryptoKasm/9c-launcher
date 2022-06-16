import React, { useEffect, useState } from "react";
import { CollectionItemModel } from "../../models/collection";
import { CollectionItemTier, CollectionPhase } from "../../types";

import "./Cart.scss";
import CartItem from "./CartItem/CartItem";
import CollectionButton from "../Button/Button";
import stepIcon from "../../common/resources/bg-staking-slot-step.png";

export type Props = {
  cartList: CollectionItemModel[];
  totalGold: number;
  onCancel: () => void;
  onPush: (item: CollectionItemModel) => void;
  onRemove: (item: CollectionItemModel) => void;
  onSubmit: () => void;
  warningMessage: string;
};

const Cart: React.FC<Props> = (props: Props) => {
  const {
    cartList,
    totalGold,
    onPush,
    onRemove,
    onCancel,
    onSubmit,
    warningMessage,
  } = props;

  const getNeedGoldAmount = (item: CollectionItemModel) => {
    let value = 0;
    cartList.forEach((x) => {
      if (x.tier <= item.tier) value += x.value;
    });
    return value;
  };

  const handleItemClick = (item: CollectionItemModel) => {
    if (item.tier !== CollectionItemTier.TIER1) return;

    const latestItem = cartList.find(
      (x) => x.collectionPhase === CollectionPhase.LATEST
    );

    if (latestItem?.tier !== CollectionItemTier.TIER1) return;
  };

  return (
    <div className={"CartContainer"}>
      <div className={"CartItemListBackground"}>
        <div className="CartWarningMessage" hidden={warningMessage === ""}>
          {warningMessage}
        </div>

        <div className={"CartItemListContainer"}>
          {cartList.map((x, i) => (
            <React.Fragment key={i}>
              <CartItem
                canCollect={totalGold >= getNeedGoldAmount(x)}
                item={x}
                onClick={handleItemClick}
                onPush={onPush}
                onRemove={onRemove}
              />
              {i !== cartList.length - 1 && (
                <img className={"StepIconPos"} src={stepIcon} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className={"CartItemListButtonContainer"}>
          <CollectionButton
            primary={true}
            width={164}
            height={55}
            onClick={onSubmit}
          >
            Apply
          </CollectionButton>
          <CollectionButton width={164} height={30} onClick={onCancel}>
            Cancel
          </CollectionButton>
        </div>
      </div>
    </div>
  );
};

export default Cart;

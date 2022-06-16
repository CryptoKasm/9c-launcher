import React from "react";
import { CollectionItemModel } from "../../models/collection";
import { CollectionPhase } from "../../types";
import { getMonsterImageFromTier } from "../../common/utils";
import ArrowIcon from "../../common/resources/ui-staking-arrow.png";

import "./CollectionItem.scss";

export type Props = {
  item: CollectionItemModel;
  isEdit: boolean;
};

const CollectionItem: React.FC<Props> = (props: Props) => {
  const { item, isEdit } = props;
  const monsterResources = getMonsterImageFromTier(item.tier);
  return (
    <div className={`CollectionItemContainer TIER${Number(item.tier)}`}>
      <div>
        <img
          src={ArrowIcon}
          className={`arrow ${
            item.collectionPhase === CollectionPhase.CANDIDATE && isEdit
              ? "visible"
              : "hide"
          }`}
        />
        <img
          className={`${
            item.collectionPhase > CollectionPhase.CANDIDATE && "Outline"
          } 
            ${
              item.collectionPhase === CollectionPhase.CANDIDATE &&
              !isEdit &&
              "Outline"
            }`}
          src={require(`../../common/resources/${monsterResources}.png`)}
        />
      </div>
    </div>
  );
};

export default CollectionItem;

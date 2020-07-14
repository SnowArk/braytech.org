import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { orderBy } from 'lodash';
import cx from 'classnames';

import { addTime, fromNow, formatTime } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';
import * as enums from '../../../utils/destinyEnums';
import { activityModeExtras } from '../../../utils/destinyUtils';
import ObservedImage from '../../ObservedImage';
import { Activities } from '../../../svg';

class ReportHeader extends React.Component {
  render() {
    const { characterIds, activityDetails, period, entries } = this.props;

    const extras = activityModeExtras(activityDetails.mode);

    // map definition - Rusted Lands, etc
    const definitionMap = manifest.DestinyActivityDefinition[activityDetails.referenceId];

    // activity definition - specific strike
    const definitionActivity = manifest.DestinyActivityDefinition[activityDetails.directorActivityHash];

    // mode definition - control, survival, etc
    const definitionMode = manifest.DestinyActivityModeDefinition[definitionActivity?.directActivityModeHash];

    // get current character entry or entry with longest activityDurationSeconds
    const entry = entries && ((characterIds && entries.find(entry => characterIds.includes(entry.characterId))) || (entries.length && orderBy(entries, [e => e.values && e.values.activityDurationSeconds && e.values.activityDurationSeconds.basic.value], ['desc'])[0]));

    // add activityDurationSeconds to activity start time
    const realEndTime = addTime(period, entry.values.activityDurationSeconds.basic.value, 'seconds');

    let mode = definitionMode?.displayProperties?.name;
    if (extras?.name) {
      mode = extras.name;
    } else if (definitionActivity?.directActivityModeType === 37) {
      mode = definitionActivity.displayProperties?.name;
    } else if (definitionActivity?.hash === 1166905690) {
      mode = definitionActivity.displayProperties.name;
    }

    return (
      <div className='basic'>
        <div className='mode'>{mode}</div>
        <div className='map'>{definitionMap?.displayProperties?.name}</div>
        <div className='ago'>
          <time dateTime={realEndTime} title={formatTime(realEndTime, 'ISO8601')}>{fromNow(realEndTime, false, true)}</time>
        </div>
      </div>
    );
  }
}

class ReportHeaderLarge extends React.Component {
  render() {
    const { t, characterIds, activityDetails, period, entries, teams } = this.props;

    const extras = activityModeExtras(activityDetails.mode);

    // map definition - Rusted Lands, etc
    const definitionMap = manifest.DestinyActivityDefinition[activityDetails.referenceId];

    // activity definition - specific strike
    const definitionActivity = manifest.DestinyActivityDefinition[activityDetails.directorActivityHash];

    // mode definition - control, survival, etc
    const definitionMode = manifest.DestinyActivityModeDefinition[definitionActivity?.directActivityModeHash];

    // get current character entry or entry with longest activityDurationSeconds
    const entry = entries && ((characterIds && entries.find(entry => characterIds.includes(entry.characterId))) || (entries.length && orderBy(entries, [e => e.values && e.values.activityDurationSeconds && e.values.activityDurationSeconds.basic.value], ['desc'])[0]));

    // add activityDurationSeconds to activity start time
    const realEndTime = addTime(period, entry.values.activityDurationSeconds.basic.value, 'seconds');

    // standing based on current character, if possible
    const standing = entry.values.standing && entry.values.standing.basic.value !== undefined ? entry.values.standing.basic.value : -1;

    // score total
    const scoreTotal = entry.values.score ? entries.reduce((v, e) => v + e.values.score.basic.value, 0) : false;

    // team scores
    const alpha = teams && teams.length ? teams.find(t => t.teamId === 17) : false;
    const bravo = teams && teams.length ? teams.find(t => t.teamId === 18) : false;
    const teamScores =
      teams && teams.length && alpha && bravo ? (
        <>
          <div className={cx('value', 'alpha', { victory: teams.find(t => t.teamId === 17 && t.standing.basic.value === 0) })}>{alpha.score.basic.displayValue}</div>
          <div className={cx('value', 'bravo', { victory: teams.find(t => t.teamId === 18 && t.standing.basic.value === 0) })}>{bravo.score.basic.displayValue}</div>
        </>
      ) : null;
    
    const simplifiedAcivityMode = enums.simplifiedAcivityModes.find(m => m.modes.indexOf(activityDetails.mode) > -1);

    const StandingVictorySVG = simplifiedAcivityMode?.name === 'gambit' ? Activities.Standing.Gambit.Victory : activityDetails.mode === 84 ? Activities.Standing.Trials.Victory : activityDetails.mode === 43 ? Activities.Standing.IronBanner.Victory : Activities.Standing.Crucible.Victory;

    let mode = definitionMode?.displayProperties?.name;
    if (extras?.name) {
      mode = extras.name;
    } else if (definitionActivity?.directActivityModeType === 37) {
      mode = definitionActivity.displayProperties?.name;
    } else if (definitionActivity?.hash === 1166905690) {
      mode = definitionActivity.displayProperties.name;
    }

    return (
      <div className={cx('head', simplifiedAcivityMode?.name)}>
        {definitionMap?.pgcrImage && <ObservedImage className='image bg' src={`https://www.bungie.net${definitionMap.pgcrImage}`} />}
        <div className='detail'>
          <div>
            <div className='mode'>{mode}</div>
            <div className='map'>{definitionMap?.displayProperties?.name}</div>
          </div>
          <div>
            <div className='duration'>{entry.values.activityDurationSeconds.basic.displayValue}</div>
            <div className='ago'>
              <time dateTime={realEndTime} title={formatTime(realEndTime, 'ISO8601')}>{fromNow(realEndTime, false, true)}</time>
            </div>
          </div>
        </div>
        {standing > -1 ? (
          <>
            <div className='standing'>
              <div className='icon'>{standing === 0 ? <StandingVictorySVG /> : <Activities.Standing.Crucible.Defeat />}</div>
              <div className='text'>{standing === 0 ? t('Victory') : t('Defeat')}</div>
            </div>
            <div className='score teams'>{teamScores}</div>
          </>
        ) : null}
        {scoreTotal && standing < 0 ? (
          <>
            <div className='score'>{scoreTotal.toLocaleString()}</div>
          </>
        ) : null}
      </div>
    );
  }
}

ReportHeader = compose(withTranslation())(ReportHeader);

ReportHeaderLarge = compose(withTranslation())(ReportHeaderLarge);

export { ReportHeader, ReportHeaderLarge };

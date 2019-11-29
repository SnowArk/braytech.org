import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';

import * as ls from '../../../utils/localStorage';

import Flashpoint from '../Modules/Flashpoint';
import HeroicStoryMissions from '../Modules/HeroicStoryMissions';
import VanguardStrikes from '../Modules/VanguardStrikes';
import BlackArmoryForges from '../Modules/BlackArmoryForges';
import DailyVanguardModifiers from '../Modules/DailyVanguardModifiers';
import Ranks from '../Modules/Ranks';
import SeasonPass from '../Modules/SeasonPass';
import SeasonalArtifact from '../Modules/SeasonalArtifact';
import Vendor from '../Modules/Vendor';
import AuthUpsell from '../Modules/AuthUpsell';
import Transitory from '../Modules/Transitory';

import { moduleRules } from '../Settings';

import './styles.css';

class Now extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);

    this.props.rebindTooltips();
  }

  render() {
    const { auth, layout } = this.props;

    const userHead = {
      ...layout.groups.find(g => g.id === 'userHead'),
      type: 'user',
      className: ['head']
    };

    const userBody = layout.groups
      .filter(g => g.type === 'body')
      .map(group => {
        const className = [];

        if (group.cols.filter(c => c.mods.filter(m => 'SeasonPass' === m.component).length).length) className.push('season-pass');

        const cols = group.cols.map(c => {
          const className = [];

          if (c.mods.filter(m => moduleRules.double.filter(f => f === m.component).length).length) className.push('double');

          return {
            ...c,
            className
          };
        });

        const full = Boolean(group.cols.filter(c => c.mods.filter(m => moduleRules.full.filter(f => f === m.component).length).length).length);

        return {
          ...group,
          className,
          type: 'user',
          full,
          cols
        };
      });

    const modules = [
      userHead,
      {
        className: ['auth-upsell'],
        condition: !auth,
        components: ['AuthUpsell']
      },
      ...userBody
    ];

    const components = {
      AuthUpsell: {
        c: <AuthUpsell />
      },
      Flashpoint: {
        c: <Flashpoint />
      },
      DailyVanguardModifiers: {
        c: <DailyVanguardModifiers />
      },
      HeroicStoryMissions: {
        c: <HeroicStoryMissions />
      },
      SeasonalArtifact: {
        c: <SeasonalArtifact />
      },
      Ranks: {
        c: <Ranks />
      },
      SeasonPass: {
        c: <SeasonPass />
      },
      BlackArmoryForges: {
        c: <BlackArmoryForges />
      }
    };

    return (
      <>
        {modules.map((group, g) => {
          if (group.components) {
            if (group.condition === undefined || group.condition) {
              return (
                <div key={g} className={cx('group', ...(group.className || []))}>
                  {group.components.map((c, i) => (
                    <React.Fragment key={i}>{components[c].c}</React.Fragment>
                  ))}
                </div>
              );
            } else {
              return null;
            }
          } else if (group.full) {
            const cols = group.cols.slice(0, 1);

            return (
              <div key={g} className={cx('group', ...(group.className || []))}>
                {cols
                  .reduce((a, v) => [...a, ...v.mods.map(m => m.component)], [])
                  .map((c, i) => (
                    <React.Fragment key={i}>{components[c].c}</React.Fragment>
                  ))}
              </div>
            );
          } else {
            const modFullSpan = group.cols.findIndex(c => c.mods.find(m => moduleRules.full.includes(m.component)));
            const modDoubleSpan = group.cols.findIndex(c => c.mods.find(m => moduleRules.double.includes(m.component)));

            const cols = modFullSpan > -1 ? group.cols.slice(0, 1) : modDoubleSpan > -1 ? group.cols.slice(0, 3) : group.cols;

            return (
              <div key={g} className={cx('group', ...(group.className || []))}>
                {group.mods
                  ? group.mods.map((mod, m) => {
                      return (
                        <div key={m} className={cx('module', ...(mod.className || []))}>
                          {mod.component}
                        </div>
                      );
                    })
                  : cols
                      .map((col, c) => {
                        if (col.condition === undefined || col.condition) {
                          return (
                            <div key={c} className={cx('column', ...(col.className || []))}>
                              {col.mods.map((mod, m) => {
                                return (
                                  <div key={m} className={cx('module', ...(mod.className || []))}>
                                    {components[mod.component].c}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        } else {
                          return false;
                        }
                      })
                      .map(c => c)}
              </div>
            );
          }
        })}
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    auth: state.auth,
    layout: state.layouts.now
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Now);

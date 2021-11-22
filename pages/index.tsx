import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableContainer,
  AppBar,
  Toolbar,
  Typography,
  Link,
  makeStyles,
} from '@material-ui/core';
import {
  NextPageContext,
  NextComponentType,
} from 'next';
import dynamic from 'next/dynamic';
import {
  Player,
  PlayerRow,
  sortPlayerRanks,
  sortPlayerRowsByRank,
} from '@shared/lib/player';
import { Twitch, Youtube } from 'react-feather';
const ReactTwitchEmbedVideo: any = dynamic(import('react-twitch-embed-video'), {
  ssr: false
})

const useStyles = makeStyles((theme) => ({
  item: {
    marginRight: theme.spacing(2),
  }
}));

interface IProps {
  players: Player[]
}

const Home: NextComponentType<NextPageContext, {}, IProps> = ({ players }) => {
  const [loaded, setLoaded] = useState(false);
  const [channel, setChannel] = useState('khazix_mains')
  const classes = useStyles();

  const rows = players.map(player => {
    const obj: any = {};
    sortPlayerRanks(player);
    obj.id = player.id;
    obj.name = player.name;
    obj.summ = player.accounts.length !== 0
      ? player.accounts[0].name
      : undefined;
    obj.region = player.accounts.length !== 0
      ? player.accounts[0].region
      : 'kr';
    obj.rank = player.accounts.length !== 0
      ? {
        tier: player.accounts[0].ranked.tier.toLowerCase(),
        division: player.accounts[0].ranked.division,
        points: player.accounts[0].ranked.points,
      } : {
        tier: 'UNKNOWN',
        division: '',
        points: 0,
      };
    obj.wins = player.accounts.reduce((acc, cur) => acc + cur.ranked.wins, 0);
    obj.losses = player.accounts.reduce((acc, cur) => acc + cur.ranked.losses, 0);
    obj.winrate = obj.losses !== -1 ? Math.round(100 / (obj.wins + obj.losses) * obj.wins) : 0;
    if (obj.losses === -1) obj.losses = 0;
    obj.stream = player.streams.length > 0 ? {
      name: player.streams[0].name,
      link: player.streams[0].link,
      type: player.streams[0].platform,
    } : undefined;
    return obj as PlayerRow;
  });
  sortPlayerRowsByRank(rows);

  useEffect(() => {
    const channels = rows
      .filter(row => row.stream)
      .map(row => row.stream!)
      .filter(stream => stream.type === 'twitch')
      .map(stream => {
        const split = stream.link.split('/');
        return split[split.length - 1];
      });

    setChannel(channels[Math.floor(Math.random() * channels.length)]);
    setLoaded(true);
  }, [])

  return (
    <>
      <AppBar color="inherit">
        <Toolbar variant="dense">

          <div className={classes.item}>
            <Typography>
              <Link href="https://discord.gg/XKBqGhu" target="_blank" color="inherit">Discord</Link>
            </Typography>
          </div>

          <div className={classes.item}>
            <Typography>
              <Link href="https://reddit.com/r/khazixmains" target="_blank" color="inherit">Reddit</Link>
            </Typography>
          </div>

          <div className={classes.item}>
            <Typography>
              <Link href="https://www.twitch.tv/team/khazixmains" target="_blank" color="inherit">Twitch</Link>
            </Typography>
          </div>

          <div className={classes.item}>
            <Typography>
              <Link href="https://www.youtube.com/khazixmains" target="_blank" color="inherit">Youtube</Link>
            </Typography>
          </div>

          <div className={classes.item}>
            <Typography>
              <Link href="https://twitter.com/khazixmains" target="_blank" color="inherit">Twitter</Link>
            </Typography>
          </div>

        </Toolbar>
      </AppBar>
      <div style={{ margin: 'auto' }}>
        <div style={{ height: '5rem' }} />
        <Container maxWidth='md'>
          <Card>
            <CardMedia>
              <img className='banner' src='/img/banner.jpg' />
            </CardMedia>
            <TableContainer>
              <Table size='small' aria-label="player table">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Player</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell>Wins</TableCell>
                    <TableCell>Losses</TableCell>
                    <TableCell>Winrate</TableCell>
                    <TableCell>Stream</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={row.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        {row.summ ? (
                          <a
                            target="_blank"
                            href={`https://${
                              row.region! === 'kr' ? 'www' : row.region
                            }.op.gg/summoner/userName=${encodeURI(row.summ)}`}
                          >
                            {row.name}
                          </a>
                        ): row.name}
                      </TableCell>
                      <TableCell>{`${row.rank.tier.charAt(0).toUpperCase() + row.rank.tier.slice(1)} ${row.rank.division}`.trim()}</TableCell>
                      <TableCell>{row.wins}</TableCell>
                      <TableCell>{row.losses}</TableCell>
                      <TableCell>{row.winrate}%</TableCell>
                      <TableCell>
                        {row.stream ? (
                          <a className={`stream-button ${row.stream.type}`} href={row.stream.link}>
                            {row.stream.name} {
                              row.stream.type === 'twitch' ? (
                              <Twitch size={16} />
                            ) : row.stream.type === 'youtube' ? (
                              <Youtube size={16} />
                            ) : null}
                          </a>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <CardContent>
              {loaded ? <ReactTwitchEmbedVideo channel={channel} /> : null}
            </CardContent> 
          </Card>
        </Container>
        <style jsx>{`
          :global(body) {
            min-height: 100vh;
            background: url('/img/background.png') center center no-repeat fixed;
            background-size: cover;
            background-color: #020814;
          }

          :global(#__next) {
            min-height: 100vh;
            display: flex;
          }
          header {
            text-align: center;
            padding: 10px;
          }

          img.banner {
            object-fit: cover;
            height: 150px;
            width: 100%;
          }

          a {
            color: white;
          }

          a.stream-button {
            box-shadow: 0 1px 2px rgba(0, 0, 0, .15);
            display: inline-block;
            padding: 2px 4px;
            border-radius: 4px;
            text-decoration: none;
          }

          a.twitch {
            color: white;
            background-color: #9147ff;
          }

          a.youtube {
            color: white;
            background-color: #ff0000;
          }

          a.stream-button :global(> *) {
            vertical-align: middle;
          }

          :global(iframe) {
            max-width: 100%;
            width: 100%;
          }
        `}</style>
        <div style={{ height: '5rem' }} />
      </div>
    </>
  )
}

Home.getInitialProps = async (ctx: NextPageContext) => {
  const players: Player[] = await (await fetch(`${process.env.host}/api/player`)).json();
  return { players }
}

export default Home
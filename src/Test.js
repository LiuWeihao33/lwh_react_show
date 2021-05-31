import React, {useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import Recorder from 'js-audio-recorder';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {useSnackbar} from 'notistack';
import {CircularProgress, FormControl, FormControlLabel, List, Radio, RadioGroup, TextField} from "@material-ui/core";
import {Alert} from "@material-ui/lab";

var server_host = "http://127.0.0.1:5000";
//var server_host = "https://lwh2.onionnet.work:8080";

let recorder = new Recorder();

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © 刘伟豪.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    icon: {
        marginRight: theme.spacing(2),
    },
    heroContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 0, 6),
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '56.25%', // 16:9
    },
    cardContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
    input: {
        display: 'none',
    },
    list: {
        marginTop: theme.spacing(6),
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    alert: {
        marginTop: theme.spacing(2)
    },
    heroButtons: {
        marginTop: theme.spacing(6),
    },
    loading: {
        marginBottom: theme.spacing(6)
    }
}));

export default function Album(props) {
    const [recorderStatus, setRecorderStatus] = useState(false);
    const [video, setVideo] = useState(null);
    const [result, setResult] = useState(null);
    const [funcType, setFuncType] = useState('input');
    const [loading, setLoading] = useState(false);
    // 音频分离
    const [voiceCounts, setVoiceCounts] = useState(1);
    const [separateResult, setSeparateResult] = useState(null);
    const [separateVideo, setSeparateVideo] = useState(null);
    // 音频混合
    const [mixResult, setMixResult] = useState(null)
    const [mixVideo, setMixVideo] = useState(null);


    const classes = useStyles();

    const {enqueueSnackbar} = useSnackbar();

    function handleSubmit() {
        switch (funcType) {
            default:
            case 'input':
                postAudio(video);
                break;
            case 'compare':
                compareAudio(video, document.querySelector("input[type='file']").files[0]);
                break;
            case 'identify':
                identify(video);
                break;
            case 'separate':
                separate(separateVideo ? document.querySelector("input[type='file']").files[0] : video)
                break;
            case 'mix':
                mix(mixVideo ? document.querySelector("input[type='file']").files[0] : video,
                    mixVideo ? document.querySelector("input[type='file']").files[1] : video,
                    mixVideo ? document.querySelector("input[type='file']").files[2] : video)
                break;
        }
    }

    function postAudio(audio) {
        let formData = new FormData();
        formData.append("audio", audio);
        setLoading(true)
        fetch(server_host + "/upload_audio", {
            method: "POST",
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    enqueueSnackbar("添加成功", {
                        variant: "success"
                    });
                } else {
                    enqueueSnackbar("添加失败", {
                        variant: 'error',
                    })
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    function compareAudio(audio1, audio2) {
        let formData = new FormData();
        formData.append("audio1", audio1);
        formData.append("audio2", audio2);
        setLoading(true)
        fetch(server_host + "/compare", {
            method: "POST",
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("请求失败");
                }
            })
            .then((json) => {
                setResult(json);
            })
            .catch((error) => {
                enqueueSnackbar("提交失败，请稍后再试", {
                    variant: 'error',
                })
            })
            .finally(() => {
                setLoading(false)
            })
    }

    function identify(audio) {
        let formData = new FormData();
        formData.append("audio", audio);
        setLoading(true)
        fetch(server_host + "/identify", {
            method: "POST",
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("请求失败");
            })
            .then((json) => setResult(json))
            .catch((error) => {
                enqueueSnackbar("提交失败，请稍后再试", {
                    variant: 'error',
                })
            })
            .finally(() => {
                setLoading(false)
            })

    }

    function separate(audio) {
        let formData = new FormData();
        formData.append("audio", audio);
        formData.append("voiceCounts", voiceCounts);
        setLoading(true)
        fetch(server_host + "/separate", {
            method: "POST",
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("请求失败");
                }
            })
            .then((json) => {
                setSeparateResult(json);
            })
            .catch((error) => {
                enqueueSnackbar("提交失败，请稍后再试", {
                    variant: 'error',
                })
            })
            .finally(() => {
                setLoading(false)
            })
    }

    function mix(audio1, audio2, audio3){
        let formData = new FormData();
        formData.append("audio1", audio1);
        formData.append("audio2", audio2);
        formData.append("audio3", audio3);
        setLoading(true)
        fetch(server_host + "/mix", {
            method: "POST",
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("请求失败");
                }
            })
            .then((json) => {
                setMixResult(json);
            })
            .catch((error) => {
                enqueueSnackbar("提交失败，请稍后再试", {
                    variant: 'error',
                })
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return (
        <React.Fragment>
            <CssBaseline/>
            <AppBar position="relative">
                <Toolbar>
                    <CameraIcon className={classes.icon}/>
                    <Typography variant="h6" color="inherit" noWrap>
                        {props.title}
                    </Typography>
                </Toolbar>
            </AppBar>
            <main>
                {/* Hero unit */}
                <div className={classes.heroContent}>
                    <Container maxWidth="md">
                        {
                            funcType === 'compare' && result && (
                                <div className={classes.alert}>
                                    <Alert
                                        severity={result?.result ? "success" : "error"}>{result?.result ? "" : "不"}是用户本人</Alert>
                                </div>
                            )
                        }
                        <div className={classes.heroButtons}>
                            <Grid container spacing={10} justify="center" style={{marginBottom: 50}}>
                                <FormControl component="fieldset">
                                    <RadioGroup row name="function-type" value={funcType} onChange={(event => {
                                        if (recorderStatus) {
                                            enqueueSnackbar("已停止录音", {
                                                variant: "warning"
                                            })
                                        }
                                        setResult(null);
                                        setVideo(null);
                                        recorder.destroy();
                                        setRecorderStatus(false);
                                        setFuncType(event.target.value);
                                    })}>
                                        <FormControlLabel value="input" control={<Radio/>} label="添加语音库"/>
                                        <FormControlLabel value="identify" control={<Radio/>} label="识别语音"/>
                                        <FormControlLabel value="compare" control={<Radio/>} label="音频比较"/>
                                        <FormControlLabel value="mix" control={<Radio/>} label="混合音频"/>
                                        <FormControlLabel value="separate" control={<Radio/>} label="音频分离"/>
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid container justify={"center"} className={classes.loading}>
                                {
                                    loading && (
                                        <CircularProgress color="secondary"/>
                                    )
                                }
                                {
                                    funcType === 'separate' && (
                                        <TextField
                                            onChange={(event => setVoiceCounts(parseInt(event.target.value)))}
                                            id="standard-basic"
                                            label="Voice counts"
                                            type={'number'}
                                            fullWidth
                                            // inputProps={{ max: 3, min: 1 }}
                                        />
                                    )
                                }
                            </Grid>
                            <Grid container spacing={10} justify="center">
                                {(funcType === 'input' || funcType === 'identify' || funcType === 'compare') && <Grid item>
                                    <Button variant="contained" onClick={() => {
                                        if (recorderStatus) {
                                            recorder.stop();
                                            setRecorderStatus(false);
                                            setVideo(recorder.getWAVBlob());
                                            enqueueSnackbar("停止录音");
                                        } else {
                                            setVideo(null);
                                            recorder.start().then(() => {
                                                setRecorderStatus(true);
                                                enqueueSnackbar("开始录音");
                                            }, (error) => enqueueSnackbar("无权限，请开启浏览器录音权限", {
                                                variant: 'error',
                                            }));
                                        }
                                    }}>
                                        点此按钮{recorderStatus ? "停止" : ""}录入音频
                                    </Button>
                                </Grid>
                                }
                                {(funcType === 'input' || funcType === 'identify' || funcType === 'compare') &&
                                <Grid item>
                                    <Button variant="contained" color="primary" disabled={!video} onClick={() => {
                                        recorder.downloadWAV("audio");
                                    }}>
                                        下载音频
                                    </Button>
                                </Grid>
                                }
                                {funcType === 'compare' && <Grid item>
                                    <input
                                        accept="audio/*"
                                        className={classes.input}
                                        id="contained-button-file"
                                        multiple
                                        type="file"
                                    />
                                    <label htmlFor="contained-button-file">
                                        <Button variant="contained" color="primary" component="span">
                                            上传对比音频
                                        </Button>
                                    </label>
                                </Grid>
                                }
                                {funcType === 'mix' && <Grid item>
                                    <input
                                        accept="audio/*"
                                        className={classes.input}
                                        id="contained-button-file"
                                        multiple
                                        type="file"
                                        onChange={event => {
                                            setMixVideo(event.target.value)
                                        }}
                                    />
                                    <label htmlFor="contained-button-file">
                                        <Button variant="contained" color="primary" component="span">
                                            上传音频
                                        </Button>
                                    </label>
                                </Grid>
                                }
                                {funcType === 'separate' && <Grid item>
                                    <input
                                        accept="audio/*"
                                        className={classes.input}
                                        id="contained-button-file"
                                        multiple
                                        type="file"
                                        onChange={event => {
                                            setSeparateVideo(event.target.value)
                                        }}
                                    />
                                    <label htmlFor="contained-button-file">
                                        <Button variant="contained" color="primary" component="span">
                                            上传混合音频
                                        </Button>
                                    </label>
                                </Grid>
                                }
                                <Grid item>
                                    <Button variant="contained" color="primary" disabled={
                                        funcType === "separate" ? !(video || separateVideo ) : !video ||
                                            funcType === "mix" ? !(video || mixVideo ) : !video
                                    }
                                            onClick={handleSubmit}>
                                        提交
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    </Container>
                    {
                        funcType === 'identify' && result && (
                            <Container maxWidth="md">
                                <Grid container spacing={4}>
                                    <div className={classes.list}>
                                        <List>
                                            {
                                                result?.map((value) => (
                                                    <ListItem button>
                                                        <ListItemText primary={`${value[0]}`} secondary={`${value[1]}`}/>
                                                    </ListItem>
                                                ))
                                            }
                                        </List>
                                    </div>
                                </Grid>
                            </Container>
                        )
                    }
                    {
                        funcType === 'separate' && separateResult && (
                            <Container maxWidth="md">
                                <Grid container spacing={4}>
                                    <div className={classes.list}>
                                        <List>
                                            {
                                                separateResult?.map((value) => (
                                                    <ListItem button>
                                                        <audio
                                                            style={{
                                                                width: "100%"
                                                            }}
                                                            controls
                                                            src={value}>
                                                            Your browser does not support the
                                                            <code>audio</code> element.
                                                        </audio>
                                                    </ListItem>
                                                ))
                                            }
                                        </List>
                                    </div>
                                </Grid>
                            </Container>
                        )
                    }
                    {
                        funcType === 'mix' && mixResult && (
                            <Container maxWidth="md">
                                <Grid container spacing={4}>
                                    <div className={classes.list}>
                                        <List>
                                            {
                                                mixResult?.map((value) => (
                                                    <ListItem button>
                                                        <audio
                                                            style={{
                                                                width: "100%"
                                                            }}
                                                            controls
                                                            src={value}>
                                                            Your browser does not support the
                                                            <code>audio</code> element.
                                                        </audio>
                                                    </ListItem>
                                                ))
                                            }
                                        </List>
                                    </div>
                                </Grid>
                            </Container>
                        )
                    }
                </div>
            </main>
            {/* Footer */}
            {/*<footer className={classes.footer}>*/}
            {/*    <Typography variant="h6" align="center" gutterBottom>*/}
            {/*        没什么好说的*/}
            {/*    </Typography>*/}
            {/*    <Typography variant="subtitle1" align="center" color="textSecondary" component="p">*/}
            {/*        2021/4/7*/}
            {/*    </Typography>*/}
            {/*    <Copyright />*/}
            {/*</footer>*/}
            {/* End footer */}
        </React.Fragment>
    );
}

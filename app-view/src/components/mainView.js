import { start, stopAndSave, getRecordingName } from '../contentScripts/userAction';
import { useEffect, useState } from 'react';
import { Form, Input, Button, Space } from 'antd';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { message } from 'antd';
import '../styles/mainview.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const MainView = () => {
    const [recordingName, setRecordingName] = useState(`${new Date().toLocaleDateString()}_Recording`);
    const [initVal, setInitVal] = useState('');
    const [animate, setAnimate] = useState(false);
    const RECORDING = gql`
      mutation($name: String, $startTime: Float, $endTime: Float, $urlInfoList: [UrlInfoInput]){
        addRecording(input: {
          name: $name
          startTime: $startTime
          endTime: $endTime
          urlInfoList: $urlInfoList
        })
      }
      `;
    const [addRecording, { data, loading, error }] = useMutation(RECORDING);

    let isStarted;

    useEffect(() => {
        getRecordingName().then(name => {
            if (name) {
                console.log("coming to anme: ", name);
                setInitVal(name);
                message.destroy();
                message.info('Recording in progress!');
            }

        }).catch(err => {
            console.error("Error in getRecordingName Function ", err);
        })
        return(() => {
            setAnimate(false);
        })
    }, []);

    if (loading) {
        console.log("Loading......");
        message.destroy();
        message.loading("Loading....");
    }

    if (error) {
        console.log("Error in addREcording ", error);
        message.destroy();
        message.error("OOPS! Please try again");
    }

    return (
        <div className='mainview_cont'>
            <div className='recording_holder'>
                <Form
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        label="Create a new recording"
                        rules={[
                            {
                                required: true,
                            },
                            {
                                type: 'string',
                                min: 5,
                                max: 20
                            },
                        ]}
                    >
                        {
                            (initVal) ? <Input type="text" autoFocus disabled={true} placeholder={initVal} /> :
                                <Input
                                    placeholder="Name your recording"
                                    type="text"
                                    autoFocus
                                    defaultValue={`${new Date().toLocaleDateString()}_Recording`}
                                    onChange={e => setRecordingName(e.target.value)}
                                    value={recordingName} maxLength={20} />
                        }
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button disabled={initVal ? true : false} type="primary" htmlType="button" onClick={async () => {
                                try {
                                    if (!recordingName) {
                                        alert("Please provide recording name to proceed");
                                        return;
                                    }
                                    if (recordingName.length < 5) return;
                                    setInitVal(recordingName);
                                    isStarted = await start(recordingName);
                                    message.destroy();
                                    message.info('Recording Started!!');
                                    console.log("Success ", isStarted)
                                } catch (err) {
                                    message.destroy();
                                    message.error("OOPS! Please try again");
                                }
                            }}>
                                Start
                            </Button>
                            <Button disabled={initVal ? false : true} htmlType="button" onClick={ () => {
                                try {
                                    confirmAlert({
                                        title: 'Confirmation!',
                                        message: 'Are you sure to proceed.',
                                        buttons: [
                                          {
                                            label: 'Save',
                                            onClick: async() => {
                                                if (isStarted || initVal) {
                                                    let recordings = await stopAndSave();
                                                    console.log("Success ", recordings);
                                                    // postRecording(recordings);
                                                    const resp = await addRecording({
                                                        variables: recordings
                                                    })
                                                    message.destroy();
                                                    message.success("Saved Successfully!! Click on Manage Loadtest to start the load test");
                                                    console.log("resp ", resp);
                                                    setInitVal('');
                                                    setRecordingName(`${new Date().toLocaleDateString()}_Recording`);
                                                    isStarted = false;
                                                    setAnimate(true);
                                                    setTimeout(() => setAnimate(false), 400);
                                                }
                                            }
                                          },
                                          {
                                            label: 'Cancel',
                                            onClick: async() => {
                                                let recordings = await stopAndSave();
                                                message.destroy();
                                                message.info('You can try again! or Click on "Manage Loadtest" to manage your saved recordings');
                                                setInitVal('');
                                                setRecordingName(`${new Date().toLocaleDateString()}_Recording`);
                                                isStarted = false;
                                                setAnimate(true);
                                                setTimeout(() => setAnimate(false), 400);
                                            }
                                          }
                                        ]
                                      });
                                    
                                    
                                } catch (err) {
                                    message.destroy();
                                    message.error("OOPS! Please try again");
                                }
                            }}>
                                Stop
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
            <div className='header'>
                <a className={`app_link ${animate ? 'animate1' : 'animate2'}`} href="http://localhost:3000/" target={"_blank"}>{`Manage Loadtest `}<img src={require('../appIcon.jpg')}></img></a>
            </div>
        </div>
    )
}

export default MainView;
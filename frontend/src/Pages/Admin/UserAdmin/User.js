import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserAction from '../../../Actions/UserAdminAction';
import { formItemLayout } from '../../../utils/customUser';
import { EditOutlined, DeleteOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { List, Card, Avatar, Modal, Popconfirm, Form, Input, Upload, Button, Select, Tag, Row, Col, message } from 'antd';

const { Meta } = Card;

function User({ users, actions }) {
    const [form] = Form.useForm();
    const [card, setCard] = useState({});
    const [disabled, setDisabled] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [role, setRole] = useState('all');
    const [data, setData] = useState(users);
    const [dataClone, setDataClone] = useState(users);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        actions.getUser();
    }, []);

    useEffect(() => {
        setData(users);
    }, [users]);

    const normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const updateHandle = () => {

        // if it's just to see user info
        if (disabled) {
            setShowModal(false);
            return;
        }

        setConfirmLoading(true);

        // axios handler goes here (PUT)

        const user = { ...card };
        console.log(card);
        
        user.isAdmin = card.role === "admin" ? true : false;
        try {
            setTimeout(() => {
                actions.updateUser(
                    {
                        ...user,
                        profilePic: typeof card.profilePic === "string" ? card.profilePic : (card.profilePic[0].originFileObj ? URL.createObjectURL(card.profilePic[0].originFileObj) : card.profilePic)
                    });
                setConfirmLoading(false);
                messageApi.open({
                    type: 'success',
                    content: 'Successfully update user!',
                });
                setShowModal(false);
            }, 2000);
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'Error to update user!',
            });
            throw error;
        }
    };

    const deleteHandle = (_id) => {

        actions.deleteUser(_id);
        setData(users);

    };

    useEffect(() => {
        if (inputValue.trim()) {
            const newData = [...data];
            var filteredData = newData.filter(({ username, email, phone, }) => `${username}${email}${phone}`.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1);
            if (role !== "all") {
                filteredData = filteredData.filter((item) => {
                    if (role === "admin") return item.isAdmin === true
                    else return item.isAdmin === false
                });
            }
            setDataClone(filteredData.length === 0 ? [] : filteredData);
        } else {
            setDataClone(role === "all" ? [...data] : data.filter((item) => {
                if (role === "admin") return item.isAdmin === true
                else return item.isAdmin === false
            }));
        }
    }, [data, role, inputValue]);

    const onSearch = (e) => {
        setInputValue(e.target.value);
    };

    const handleChange = (value) => {
        setRole(value);
        setDataClone(value === "all" ? [...data] : data.filter((item) => item.role === value));
    };

    return (
        <div className='mt-3'>
            {contextHolder}
            <h3 className='my-2'>User List</h3>
            <Row style={{ width: '100%' }} className="mt-3 align-items-center">
                <Col span={2}><b>Search: </b> </Col>
                <Col span={4}>
                    <Input
                        placeholder="input search text"
                        onChange={e => onSearch(e)}
                        allowClear
                        suffix={<SearchOutlined />}
                    />
                </Col>
                <Col span={2} className="ms-3"><b>Role: </b> </Col>
                <Col span={3}>
                    <Select defaultValue="all" onChange={handleChange} style={{ width: '100%' }}>
                        <Select.Option value="all">All</Select.Option>
                        <Select.Option value="admin">Admin</Select.Option>
                        <Select.Option value="user">User</Select.Option>
                    </Select>
                </Col>

            </Row>

            <List
                className='mt-4'
                grid={{ gutter: 16 }}
                dataSource={dataClone}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            style={{ width: 270 }}
                            hoverable
                            onDoubleClick={() => {
                                try {
                                    setCard({ ...item });
                                    setDisabled(true);
                                    form.setFieldsValue({
                                        ...item,
                                        profilePic: [{ uid: '-1', url: item.profilePic }],
                                        role: item.isAdmin ? "admin" : "user",
                                    });

                                } catch (error) {
                                    throw error;
                                }
                                setShowModal(true);
                            }}
                            actions={[
                                <EditOutlined onClick={() => {
                                    try {
                                        setCard({ ...item });
                                        setDisabled(false);
                                        form.setFieldsValue({
                                            ...item,
                                            profilePic: [{ uid: '-1', url: item.profilePic }],
                                            role: item.isAdmin ? "admin" : "user"
                                        });
                                    } catch (e) {

                                    }
                                    setShowModal(true);
                                }} />,
                                <Popconfirm title="Sure to delete?" onConfirm={() => deleteHandle(item._id)}>
                                    <span style={{ cursor: "pointer" }}><DeleteOutlined /></span>
                                </Popconfirm>
                            ]}
                        >
                            <Meta
                                avatar={<Avatar src={item.profilePic ? item.profilePic : "https://haycafe.vn/wp-content/uploads/2022/02/Avatar-trang-den.png"} />}
                                title={item.username}
                                description={item.email}
                            >
                            </Meta>
                            <Tag color={item.isAdmin === true ? "gold" : "blue"} className="ms-5 mt-2" key={item._id}>{item.isAdmin ? "ADMIN" : "USER"}</Tag>
                        </Card>
                    </List.Item>
                )}
            >
            </List>
            <Modal
                mask={false}
                title={disabled ? "User Info" : "User Updating"}
                open={showModal}
                onOk={updateHandle}
                onCancel={() => setShowModal(false)}
                confirmLoading={confirmLoading}
            >
                <Form
                    {...formItemLayout}
                    form={form}
                    style={{ width: 430 }}
                    onValuesChange={(value) => {
                        if (value.img && value.profilePic.length !== 0) {
                            setCard({ ...card, profilePic: [{ ...value.profilePic[0] }] })
                        } else {
                            setCard({ ...card, ...value });
                        }
                    }}
                    disabled={disabled}
                    initialValues={
                        {
                            role: "User"
                        }
                    }
                    scrollToFirstError
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Username!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="E-mail"
                        rules={[
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Password!',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password readOnly />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[{ required: true, message: 'Please input your Phone number!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select your Role!' }]}
                    >
                        <Select>
                            <Select.Option value="admin">Admin</Select.Option>
                            <Select.Option value="user">User</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="profilePic"
                        label="Profile Pic"
                        valuePropName='fileList'
                        getValueFromEvent={normFile}
                        rules={[
                            {
                                required: true,
                                message: 'Please upload image',
                            },
                        ]}
                    >
                        <Upload
                            listType='picture'
                            beforeUpload={() => false}
                            accept=".png, .jpeg"
                            multiple={false}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        users: state.userAdmin
    };
};

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(UserAction, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(User);
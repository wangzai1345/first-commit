

        import "./Captain.css"; 
        import axios from 'axios';
        import { useState } from 'react';
        import getPreviewElement from "./GetPreviewElement";


         function Captain() {
            /*  const [existingState, setExistingState] = useState(''); */
         
             // 新增文件上传相关状态
             const [selectedFile, setSelectedFile] = useState(null);
             const [uploadStatus, setUploadStatus] = useState('');
             const [previewUrl, setPreviewUrl] = useState('');
/*              const [createTime, setCreateTime] = useState(''); */

             // 允许的文件类型
             const allowedTypes = [
                 'application/pdf',
                 'application/vnd.ms-powerpoint',
                 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                 'application/msword',
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                 'image/jpeg',
                 'image/png',
                 'image/gif'
             ];
         
             // 处理文件选择
             const handleFileSelect = (e) => {                                     
                 const file = e.target.files[0];                                   
         
                 if (file && allowedTypes.includes(file.type)) {                  
                     setSelectedFile(file);                      
                     setUploadStatus('');
                     const reader = new FileReader();                               //FileReader对象允许Web应用程序异步读取存储在用户计算机上的文件
                     reader.onload = (event) => {                                   //事件处理函数,文件读取完成时触发
                         setPreviewUrl(event.target.result);                        //result包括文件的内容，用setPreviewUrl，返回到PreviewUrl
                     };
                     reader.readAsDataURL(file);                                    //开始读取文件，读取结果为base64编码的字符串
                 } else {                                                           //如果file不存在或者file的类型不在allowedTypes数组中
                     setUploadStatus('仅支持 PPT/PDF/Word/图片 文件！');            //设置上传状态为显示 仅支持 PPT/PDF/Word/图片 文件！
                     setSelectedFile(null);                                        //不显示文件
                     setPreviewUrl('');                                             //文件内容为空
                 }
             };
         
             // 处理文件上传
             const handleUpload = async () => {
                 if (!selectedFile) {//未选择文件
                     setUploadStatus('请先选择文件！');//设置上传状态为显示 请先选择文件！
                     return;//返回后面为空表示终止
                 }
         
                 const formData = new FormData();
                 formData.append('file', selectedFile);//键是指传输文件，值是选择的文件
         
                 try {
                    const response = await axios.post('http://localhost:5000/upload', formData, {//POST 请求用于向指定资源提交数据，通常会导致服务器端的状态发生变化。
                        headers: { 'Content-Type': 'multipart/form-data' }                       //表示上传的是文件数据
                    });
                    setUploadStatus(`上传成功！路径：${response.data.path}`);
                } catch (error) {
                    setUploadStatus('上传失败：' + error.message);
                }
             };
         
             // 新增数据函数
             const addRow = () => {
                 const table = document.getElementById("table");
                 const length = table.rows.length;
                 const newRow = table.insertRow(length);//插入新的一行，length决定插入的位置
                
                 const nameCol = newRow.insertCell(0);
                 const phoneCol = newRow.insertCell(1);
                 const collegeCol = newRow.insertCell(2);
                 const actionCol = newRow.insertCell(3);
         
                nameCol.innerHTML = '未命名';
                phoneCol.innerHTML = '无学号';
                collegeCol.innerHTML = '学院名称';
                actionCol.innerHTML = '<button onclick="editRow(this)">编辑</button> <button onclick="deleteRow(this)">删除</button>';
             };
         
                const deleteRow = (button) => {
                 const row = button.parentNode.parentNode;
                 row.parentNode.removeChild(row);//row的父元素被选取并删除了row这个子元素
             };
         

                 const editRow = (button) => {
                 const row = button.parentNode.parentNode;
                 const name = row.cells[0];
                 const phone = row.cells[1];
                 const college = row.cells[2];
         
                 const inputName = prompt("请输入成员的名字:");
                 const inputPhone = prompt("请输入成员的学号:");
                 const inputCollege = prompt("请输入成员的学院:");
         
                 if (inputName === null || inputName === "") {
                     name.innerHTML = '未命名';
                 } else {
                     name.innerHTML = inputName;
                 }
         
                 if (inputPhone === null || inputPhone === "") {
                     phone.innerHTML = '无学号';
                 } else {
                     phone.innerHTML = inputPhone;
                 }
                 if (inputCollege === null || inputCollege === "") {
                     college.innerHTML = '学院名称';
                 } else {
                     college.innerHTML = inputCollege;
                 }
             };
/*              const submitTeamInfo = () => {
                const now = new Date();
                const formattedTime = now.toLocaleString();
                setCreateTime(formattedTime);
        
        
                console.log('队伍名称:', teamName);
                console.log('队长学号:', captainId);
                console.log('队长姓名:', captainName);
                console.log('队长学院:', captainCollege);
                console.log('队员信息:', teamMembers);
                console.log('创建时间:', createTime);
            }; */
             
             //在浏览器环境里，window 对象是全局对象，这意味着这些函数在全局作用域中是可访问的。
             window.addRow = addRow;
             window.deleteRow = deleteRow;
             window.editRow = editRow;
         

             const getPreviewElement = () => {
                 if (!previewUrl) //预览文件不存在
                 {
                    return null;
                 }


                 //如果选择图片文件，显示预览路径的图像，不成功则显示preview
                 //如果选择pdf文件，种类即pdf
                 //如果选择了office文件
                 //样式都为宽度100%，高600px，以及10px的外边距



                 if (selectedFile.type.startsWith('image/')) {
                     return <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />;
                 } else if (selectedFile.type === 'application/pdf') {
                     return <embed src={previewUrl} type="application/pdf" style={{ width: '100%', height: '600px', marginTop: '10px' }} />;
                 } else if (
                     selectedFile.type === 'application/vnd.ms-powerpoint' ||
                     selectedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                     selectedFile.type === 'application/msword' ||
                     selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                 ) {
                     const officePreviewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`;
                     return <iframe src={officePreviewUrl} style={{ width: '100%', height: '600px', marginTop: '10px' }}></iframe>;
                 }
                 return null;
             };
         
             return (
                 <div>
                     <label>队伍名称：</label>
                     <input type="text" id="name" placeholder="请输入队伍名称" />
                     <br></br>
                     <button id="add" onClick={addRow}>添加新成员信息</button>
                     <table id="table">
                         <tr>
                             <th>姓名</th>
                             <th>学号</th>
                             <th>学院</th>
                             <th>操作</th>
                         </tr>
                         <tr>
                             <td>示例姓名</td>
                             <td>Bxxxxxxxx</td>
                             <td>学院名称</td>
                             <td>
                                 <button onClick={(e) => editRow(e.target)}>编辑</button>
                                 <button onClick={(e) => deleteRow(e.target)}>删除</button>
                             </td>
                         </tr>
                     </table>



                     <div style={{
                         marginTop: '20px',
                         padding: '20px',
                         border: '2px dashed #ccc',
                         borderRadius: '8px'
                     }}>
                         <h3>请在此处上传您的附件</h3>
                         <input
                             type="file"
                             onChange={handleFileSelect}
                             style={{ display: 'block', margin: '10px 0' }}
                         />
                         <button
                             onClick={handleUpload}
                             style={{
                                 padding: '8px 16px',
                                 backgroundColor: '#4CAF50',
                                 color: 'white',
                                 border: 'none',
                                 borderRadius: '4px',
                                 cursor: 'pointer'
                             }}
                         >
                             提交文件
                         </button>
         
                         
                         {uploadStatus && (
                             <p style={{
                                 marginTop: '10px',
                                 color: uploadStatus.includes('成功') ? 'green' : 'red'
                             }}>
                                 {uploadStatus}
                             </p>
                         )}
         
                         
                         {selectedFile && (
                             <div style={{ marginTop: '10px' }}>
                                 <p>文件名：{selectedFile.name}</p>
                                 <p>文件类型：{selectedFile.type}</p>
                                 <p>文件大小：{(selectedFile.size / 1024).toFixed(2)} KB</p>
                             </div>
                         )}
         
                         
                         {getPreviewElement()}
                     </div>
                 </div>
             );
         }
         
         export default Captain;
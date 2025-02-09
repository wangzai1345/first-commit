

        import "./Captain.css"; 
        import axios from 'axios';
        import { useState } from 'react';
        


         function Captain() {
           
         
                // 使用 useState 定义多个状态
             const [selectedFile, setSelectedFile] = useState(null);
             const [uploadStatus, setUploadStatus] = useState('');
             const [previewUrl, setPreviewUrl] = useState('');


             
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
                     const reader = new FileReader();                           
                     reader.onload = (event) => {                                   
                         setPreviewUrl(event.target.result);                       
                     };
                     reader.readAsDataURL(file);                                  
                 } else {                                                          
                     setUploadStatus('仅支持 PPT/PDF/Word/图片 文件！');           
                     setSelectedFile(null);                                     
                     setPreviewUrl('');                                            
                 }
             };
         
             // 处理文件上传
             const handleUpload = async () => {
                 if (!selectedFile) {
                     setUploadStatus('请先选择文件！');
                     return;
                 }
         
                 const formData = new FormData();
                 formData.append('file', selectedFile);
         
                 try {
                    const response = await axios.post('http://localhost:5000/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }                       
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

             
             //在浏览器环境里，window 对象是全局对象，这意味着这些函数在全局作用域中是可访问的。
             window.addRow = addRow;
             window.deleteRow = deleteRow;
             window.editRow = editRow;
         

             const getPreviewElement = () => {
                 if (!previewUrl) //预览文件不存在
                 {
                    return null;
                 }




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
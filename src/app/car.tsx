import React, { MouseEventHandler } from 'react'
import './Car.less'
import BezierMaker from '../static/js/bezierMaker.js'
type Point = {
    x: number,
    y: number
}
type StateType = {
	canvas: HTMLCanvasElement | null,
    ctx: CanvasRenderingContext2D | null,
    t: number //贝塞尔函数涉及的占比比例，0<=t<=1
    clickNodes: Array<Point> //点击的控制点对象数组
    bezierNodes: Array<Point> //绘制内部控制点的数组
    isPrinted: boolean //当前存在绘制的曲线
    isPrinting: boolean //正在绘制中
    num: number //控制点数
    isDrag: boolean //是否进入拖拽行为
    isDragNode: boolean //是否点击到了控制点
    dragIndex: number //被拖拽的点的索引
    clickon: number //鼠标按下时间戳
    clickoff: number //鼠标抬起时间戳
}
function factorial(num: number): number { //递归阶乘
    if (num <= 1) {
        return 1;
    } else {
        return num * factorial(num - 1);
    }
}
function bezier(arr: Array<Point>, t: number) { //通过各控制点与占比t计算当前贝塞尔曲线上的点坐标
    var x = 0,
        y = 0,
        n = arr.length - 1
    arr.forEach(function(item, index) {
        if(!index) {
            x += item.x * Math.pow(( 1 - t ), n - index) * Math.pow(t, index) 
            y += item.y * Math.pow(( 1 - t ), n - index) * Math.pow(t, index) 
        } else {
            x += factorial(n) / factorial(index) / factorial(n - index) * item.x * Math.pow(( 1 - t ), n - index) * Math.pow(t, index)
            y += factorial(n) / factorial(index) / factorial(n - index) * item.y * Math.pow(( 1 - t ), n - index) * Math.pow(t, index)
        }
    })
    return {
        x: x,
        y: y
    }
}
export default class Car extends React.Component<any, StateType> {
	constructor(props: any) {
		super(props)
		this.state = {
			canvas: null,
			ctx: null,
            t: 0, //贝塞尔函数涉及的占比比例，0<=t<=1
            clickNodes: [], //点击的控制点对象数组
            bezierNodes: [], //绘制内部控制点的数组
            isPrinted: false, //当前存在绘制的曲线
            isPrinting: false, //正在绘制中
            num: 0, //控制点数
            isDrag: false, //是否进入拖拽行为
            isDragNode: false, //是否点击到了控制点
            dragIndex: 0, //被拖拽的点的索引
            clickon: 0, //鼠标按下时间戳
            clickoff: 0, //鼠标抬起
		}
	}
	drawBezier(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, origin_nodes: Array<Point>) {
        let {t, isPrinting} = this.state
        console.log(t, 'dwadwa');
        
		if(t > 1) {
            isPrinting = false
            this.setState({
                isPrinting: isPrinting,
            })
            return
        }
        isPrinting = true
        let nodes = origin_nodes
        t += 0.01
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.setState({
            isPrinting: isPrinting,
            t: t
        })
        this.drawnode(ctx, nodes)
        window.requestAnimationFrame(this.drawBezier.bind(this, ctx, canvas, nodes))
	}
    drawnode(ctx: CanvasRenderingContext2D, nodes: Array<Point>) {
        if(!nodes.length) return
        var _nodes = nodes
        var next_nodes = []
        var bezierNodes = this.state.bezierNodes
        _nodes.forEach((item, index) => {
            var x = item.x,
                y = item.y
            if(_nodes.length === this.state.num) {
                ctx.font = "16px Microsoft YaHei"
                var i = index + 1
                ctx.fillText("p" + i, x, y + 20)
            }
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2, false)
            ctx.fill()
            if(_nodes.length === 1) {
                bezierNodes.push(item)
                if(bezierNodes.length > 1) {
                    bezierNodes.forEach(function (obj, i) {
                        if (i) {
                            var startX = bezierNodes[i - 1].x,
                                startY = bezierNodes[i - 1].y,
                                x = obj.x,
                                y = obj.y
                            ctx.beginPath()
                            ctx.moveTo(startX, startY)
                            ctx.lineTo(x, y)
                            ctx.strokeStyle = 'red'
                            ctx.stroke()
                        }
                    })
                }
            }
            if(index) {
                var startX = _nodes[index - 1].x,
                    startY = _nodes[index - 1].y
                ctx.beginPath()
                ctx.moveTo(startX, startY)
                ctx.lineTo(x, y)
                ctx.strokeStyle = '#696969'
                ctx.stroke()
            }
        })
        this.setState({
            bezierNodes: bezierNodes
        })
        if(_nodes.length) {
            for(var i = 0; i < _nodes.length - 1; i++) {
                var arr = [{
                    x: _nodes[i].x,
                    y: _nodes[i].y
                }, {
                    x: _nodes[i + 1].x,
                    y: _nodes[i + 1].y 
                }]
                next_nodes.push(bezier(arr, this.state.t))
            }
            this.drawnode(ctx, next_nodes)
        }
    }
	componentDidMount() {
		const canvas = document.getElementById('map') as HTMLCanvasElement
		const ctx = canvas.getContext('2d')
		canvas.width = window.innerWidth * 0.9
		canvas.height = canvas.width
		this.setState({
            canvas: canvas,
            ctx: ctx
        })
	}
    // canvas的各种事件
    handleMouseDown (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        // 设置拖动状态为true  并且记下按下鼠标的时间戳
        this.setState({
            isDrag: true,
            clickon: new Date().getTime()
        })
        let clickNodes = this.state.clickNodes
        var x = e.nativeEvent.offsetX,
            y = e.nativeEvent.offsetY
        clickNodes.forEach((item, index) => {
            // 循环点位  判断当前鼠标是否点在了某个点上  如果是则记下suoyin
            var absX = Math.abs(item.x - x),
                absY = Math.abs(item.y - y)
            if(absX < 5 && absY < 5) {
                this.setState({
                    isDrag: true,
                    dragIndex: index
                })
            }
        })
    };
    handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        let {isDrag, isDragNode, clickNodes, dragIndex, isPrinted} = this.state
        const canvas = this.state.canvas as HTMLCanvasElement
        const ctx = this.state.ctx as CanvasRenderingContext2D
        if(isDrag && isDragNode) {
            var x = e.nativeEvent.offsetX,
            y = e.nativeEvent.offsetY
            clickNodes[dragIndex] = {
                x: x,
                y: y
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            clickNodes.forEach((item, index) => {
                var x = item.x,
                    y = item.y,
                    i = index + 1
                ctx.fillText("p" + i, x, y + 20)
                ctx.beginPath()
                ctx.arc(x, y, 4, 0, Math.PI * 2, false)
                ctx.fill()
                if (index) {
                    var startX = clickNodes[index - 1].x,
                        startY = clickNodes[index - 1].y
                    ctx.beginPath()
                    ctx.moveTo(startX, startY)
                    ctx.lineTo(x, y)
                    ctx.stroke()
                }
            })
            if(isPrinted) {
                let bezierArr:Array<Point> = []
                for(let i = 0; i < 1; i+=0.01) {
                    bezierArr.push(bezier(clickNodes, i))
                }
                bezierArr.forEach(function(obj, index) {
                    if (index) {
                        var startX = bezierArr[index - 1].x,
                            startY = bezierArr[index - 1].y,
                            x = obj.x,
                            y = obj.y
                        ctx.beginPath()
                        ctx.moveTo(startX, startY)
                        ctx.lineTo(x, y)
                        ctx.strokeStyle = 'red'
                        ctx.stroke()
                    }
                })
            }
        }
    }
    handleMouseUp(e:React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        const ctx = this.state.ctx as CanvasRenderingContext2D
        this.setState({
            isDrag: false,
            isDragNode: false,
            clickoff: new Date().getTime()
        }, () => {
            let {clickoff, clickon, isPrinted, isDragNode, num, clickNodes} = this.state
            if(clickoff - clickon < 200) {
                var x = e.nativeEvent.offsetX,
                y = e.nativeEvent.offsetY
                if(!isPrinted && !isDragNode) {
                    num++
                    ctx.font = "16px Microsoft YaHei"
                    ctx.fillStyle = '#696969'
                    ctx.fillText(`p${num}(${x}, ${y})`, x, y + 20);
                    ctx.beginPath()
                    ctx.arc(x, y, 4, 0, Math.PI * 2, false)
                    ctx.fill()
                    if(clickNodes.length) {
                        var startX = clickNodes[clickNodes.length - 1].x,
                            startY = clickNodes[clickNodes.length - 1].y
                        ctx.beginPath()
                        ctx.moveTo(startX, startY)
                        ctx.lineTo(x, y)
                        ctx.strokeStyle = '#696969'
                        ctx.stroke()
                    }
                    clickNodes.push({
                        x: x,
                        y: y
                    })
                    this.setState({
                        num: num,
                        clickNodes: clickNodes
                    })
                }
            }
        })
    }
    // 按钮的事件
    handleDrawClick(e: React.MouseEvent<HTMLButtonElement>) {
        if(!this.state.num) return
        if(!this.state.isPrinting) {
            this.setState({
                isPrinted: true
            }, () => {
                this.drawBezier(this.state.ctx as CanvasRenderingContext2D, this.state.canvas as HTMLCanvasElement, this.state.clickNodes)
            })
        }
    }
    handleResetClick(e: React.MouseEvent<HTMLButtonElement>) {
        if(!this.state.isPrinting) {
            const canvas = this.state.canvas as HTMLCanvasElement
            const ctx = this.state.ctx as CanvasRenderingContext2D
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            this.setState({
                isPrinted: false,
                clickNodes: [],
                bezierNodes: [],
                t: 0,
                num: 0
            })
        }
    }
	render() {
		return (
			<div className="stage">
				<canvas id="map" onMouseUp={this.handleMouseUp.bind(this)} onMouseMove={this.handleMouseMove.bind(this)} onMouseDown={this.handleMouseDown.bind(this)}></canvas>
                <button onClick={this.handleDrawClick.bind(this)} type="button" className="btn">绘制</button>
                <button onClick={this.handleResetClick.bind(this)} type="button" className="btn">清空</button>
            </div>
		)
	}
}
